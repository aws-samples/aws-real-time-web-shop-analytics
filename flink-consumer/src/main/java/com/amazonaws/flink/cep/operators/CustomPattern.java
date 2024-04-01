package com.amazonaws.flink.cep.operators;

import com.amazonaws.flink.cep.events.ClickEvent;
import org.apache.flink.cep.pattern.Pattern;
import org.apache.flink.cep.pattern.conditions.SimpleCondition;
import org.apache.flink.streaming.api.windowing.time.Time;

public class CustomPattern {

    public static Pattern<ClickEvent, ?> pattern() {
        return Pattern
                .<ClickEvent>begin("add_to_cart")
                .where(new SimpleCondition<ClickEvent>() {
                    @Override
                    public boolean filter(ClickEvent event) throws Exception {
                        return event.getActionType().equals("add_to_cart");
                    }
                })
                .followedBy("add_to_cart_or_click")
                .where(new SimpleCondition<ClickEvent>() {
                    @Override
                    public boolean filter(ClickEvent event) throws Exception {
                        return event.getActionType().equals("add_to_cart") || event.getActionType().equals("click");
                    }
                })
                .notFollowedBy("purchase")
                .where(new SimpleCondition<ClickEvent>() {
                    @Override
                    public boolean filter(ClickEvent event) throws Exception {
                        return event.getActionType().equals("purchase");
                    }
                })
                .within(Time.minutes(1));
    }
}
