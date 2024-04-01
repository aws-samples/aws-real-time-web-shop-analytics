package com.amazonaws.flink.cep.operators;

import org.apache.flink.connector.opensearch.sink.OpensearchSink;
import org.apache.flink.connector.opensearch.sink.OpensearchSinkBuilder;
import org.apache.http.HttpHost;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.client.Requests;
import org.opensearch.common.xcontent.XContentType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AmazonOpenSearchSink {

    private static final Logger LOG = LoggerFactory.getLogger(AmazonOpenSearchSink.class);

    private static <T> IndexRequest createIndexRequest(T element, String index) {
        LOG.info("Element: " + element.toString());
        return Requests.indexRequest()
                .index(index)
                .source(element.toString(), XContentType.JSON);
    }

    public static <T> OpensearchSink<T> buildOpenSearchSink(String openSearchEndpoint, String indexName) {
        final HttpHost host = HttpHost.create(openSearchEndpoint);
        return new OpensearchSinkBuilder<T>()
                .setHosts(host)
                .setEmitter(
                        (element, context, indexer) ->
                                indexer.add(createIndexRequest(element, indexName)))
                .build();
    }
}