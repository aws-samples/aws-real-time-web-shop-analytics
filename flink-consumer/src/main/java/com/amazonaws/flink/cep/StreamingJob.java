/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.amazonaws.flink.cep;

import com.amazonaws.flink.cep.events.ClickEvent;
import com.amazonaws.flink.cep.operators.*;
import com.amazonaws.flink.cep.utils.GsonUtils;
import com.amazonaws.services.kinesisanalytics.runtime.KinesisAnalyticsRuntime;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.cep.CEP;
import org.apache.flink.cep.PatternStream;
import org.apache.flink.cep.functions.PatternProcessFunction;
import org.apache.flink.streaming.api.datastream.*;
import org.apache.flink.streaming.api.environment.LocalStreamEnvironment;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.windowing.assigners.TumblingProcessingTimeWindows;
import org.apache.flink.streaming.api.windowing.time.Time;
import org.apache.flink.streaming.connectors.kinesis.FlinkKinesisConsumer;
import org.apache.flink.streaming.connectors.kinesis.config.ConsumerConfigConstants;

import org.apache.flink.util.Collector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.*;


public class StreamingJob {

	private static final Logger LOG = LoggerFactory.getLogger(StreamingJob.class);

	private static DataStream<String> createDataStreamFromKinesis(
			StreamExecutionEnvironment env, Properties applicationProperties) {
		Properties inputProperties = new Properties();
		inputProperties.setProperty(ConsumerConfigConstants.AWS_REGION, applicationProperties.getProperty("REGION"));
		inputProperties.setProperty(ConsumerConfigConstants.STREAM_INITIAL_POSITION, "LATEST");

		return env.addSource(new FlinkKinesisConsumer<>(applicationProperties.getProperty("INPUT_STREAM_NAME"),
				new SimpleStringSchema(), inputProperties));
	}

	private void execute() throws Exception {

		LOG.info("Starting StreamingJob.");
		final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

		Properties applicationProperties;
		if (env instanceof LocalStreamEnvironment) {
			LOG.info("LocalStreamEnvironment.");
			env.setParallelism(1);
            applicationProperties = new Properties();
            applicationProperties.setProperty("REGION", System.getenv("REGION"));
			applicationProperties.setProperty("INPUT_STREAM_NAME", System.getenv("INPUT_STREAM_NAME"));
            applicationProperties.setProperty("OPEN_SEARCH_ENDPOINT", System.getenv("OPEN_SEARCH_ENDPOINT"));
        } else {
			LOG.info("CloudStreamEnvironment.");
			applicationProperties = KinesisAnalyticsRuntime.getApplicationProperties().get("FlinkApplicationProperties");
		}

		DataStream<String> inputStream = createDataStreamFromKinesis(env, applicationProperties);
		LOG.info("Creating DataStream from Kinesis.");

		// Map input string to ClickEvent class object
		DataStream<ClickEvent> inputClickEventStream = inputStream.map(new ClickEventMapper());

		// Set watermark strategy
		LOG.info("Setting Watermark Strategy");

		var watermarkStrategy = WatermarkStrategy
				//.<ClickEvent>forMonotonousTimestamps()
				.<ClickEvent>forBoundedOutOfOrderness(Duration.ofSeconds(1))
				.withTimestampAssigner((event, timestamp) -> event.getDateTime());

		// Assign proper timestamps and watermarks
		DataStream<ClickEvent> watermarkedInputStream = inputClickEventStream
				.assignTimestampsAndWatermarks(watermarkStrategy);

		// Apply the deduplication logic to remove duplicates in the click stream
		DataStream<ClickEvent> deduplicatedStream = watermarkedInputStream
				.keyBy(event -> event.getUserId() + "_" + event.getSessionId())
				.window(TumblingProcessingTimeWindows.of(Time.seconds(60)))
				.apply(new DeduplicateWindowFunction());

		// Get the most popular products
		// Count the total number of times each product id is added to cart
		DataStream<HashMap<String, Object>> mostPopularProductStream = deduplicatedStream
				.filter(event -> event.getActionType().equals("add_to_cart"))
				.keyBy(event -> event.getProductId())
				.process(new CountProductProcessFunction());

		PatternStream<ClickEvent> makePurchaseStream = CEP.pattern(
				deduplicatedStream,
				CustomPattern.pattern()
		);

		DataStream<ClickEvent> notMadePurchaseStream = makePurchaseStream.process(new PatternProcessFunction<ClickEvent, ClickEvent>() {
			@Override
			public void processMatch(Map<String, List<ClickEvent>> pattern, Context ctx, Collector<ClickEvent> out) {
				out.collect(pattern.get("add_to_cart").get(0));
			}
		});

		LOG.info("Preparing to write to OpenSearch.");
		// Prepare to write Streams to OpenSearch Sink
		DataStream<Object> inputClickEventStreamJson = inputClickEventStream.map(x -> GsonUtils.toJson(x));
		DataStream<Object> mostPopularProductStreamJson = mostPopularProductStream.map(x -> GsonUtils.toJson(x));
		DataStream<Object> deduplicatedStreamJson = deduplicatedStream.map(x -> GsonUtils.toJson(x));
		DataStream<Object> notMadePurchaseStreamJson = notMadePurchaseStream.map(x -> GsonUtils.toJson(x));

		if (env instanceof LocalStreamEnvironment) {

			inputClickEventStreamJson.print("InputJson: ");
			deduplicatedStreamJson.print("DeduplicatedJson: ");
			mostPopularProductStreamJson.print("MostPopularJson: ");
			notMadePurchaseStreamJson.print("NotMadePurchaseJson: ");

		} else {

			var openSearchEndpoint = applicationProperties.getProperty("OPEN_SEARCH_ENDPOINT");

			inputClickEventStreamJson.sinkTo(AmazonOpenSearchSink.buildOpenSearchSink(openSearchEndpoint, "input_events"));
			mostPopularProductStreamJson.sinkTo(AmazonOpenSearchSink.buildOpenSearchSink(openSearchEndpoint, "most_popular_products"));
			deduplicatedStreamJson.sinkTo(AmazonOpenSearchSink.buildOpenSearchSink(openSearchEndpoint, "deduplicated_events"));
			notMadePurchaseStreamJson.sinkTo(AmazonOpenSearchSink.buildOpenSearchSink(openSearchEndpoint, "not_made_purchase_events"));
		}

		env.execute("Executing Flink Job");
	}

	public static void main(String[] args) throws Exception {

		StreamingJob job = new StreamingJob();
		job.execute();

	}

}