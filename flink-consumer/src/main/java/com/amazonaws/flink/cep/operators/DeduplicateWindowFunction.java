package com.amazonaws.flink.cep.operators;

import com.amazonaws.flink.cep.events.ClickEvent;
import org.apache.flink.streaming.api.functions.windowing.WindowFunction;
import org.apache.flink.streaming.api.windowing.windows.TimeWindow;
import org.apache.flink.util.Collector;

import java.util.HashSet;
import java.util.Set;

public class DeduplicateWindowFunction implements WindowFunction<ClickEvent, ClickEvent, String, TimeWindow> {

    @Override
    public void apply(String key, TimeWindow window, Iterable<ClickEvent> input, Collector<ClickEvent> out) {
        Set<ClickEvent> clickEventSet = new HashSet<>();
        for (ClickEvent event : input) {
            if (!clickEventSet.contains(event)) {
                clickEventSet.add(event);
                out.collect(event);
            }
        }
    }
}