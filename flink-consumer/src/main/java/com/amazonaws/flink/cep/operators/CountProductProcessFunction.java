package com.amazonaws.flink.cep.operators;

import com.amazonaws.flink.cep.events.ClickEvent;
import org.apache.flink.api.common.state.ValueState;
import org.apache.flink.api.common.state.ValueStateDescriptor;
import org.apache.flink.streaming.api.functions.KeyedProcessFunction;
import org.apache.flink.util.Collector;
import org.apache.flink.configuration.Configuration;

import java.util.HashMap;

public class CountProductProcessFunction extends KeyedProcessFunction<String, ClickEvent, HashMap<String, Object>> {

        private ValueState<Integer> countState;

        @Override
        public void open(Configuration parameters) throws Exception {
            super.open(parameters);
            ValueStateDescriptor<Integer> descriptor =
                    new ValueStateDescriptor<>("countState", Integer.class);
            countState = getRuntimeContext().getState(descriptor);
        }

        @Override
        public void processElement(ClickEvent event, Context ctx, Collector<HashMap<String, Object>> out) throws Exception {

            // Access the count state for the current key
            Integer currentCount = countState.value();

            // Update the count state
            int updatedCount = (currentCount != null) ? currentCount + 1 : 1;
            countState.update(updatedCount);

            // Emit the updated count
            HashMap<String, Object> map = new HashMap<>();
            map.put("productId", event.getProductId());
            map.put("count", updatedCount);
            out.collect(map);
        }
}
