package com.amazonaws.flink.cep.operators;

import com.amazonaws.flink.cep.events.ClickEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.common.functions.MapFunction;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;

public class ClickEventMapper implements MapFunction<String, ClickEvent> {

    private static final Logger LOG = LogManager.getLogger(ClickEventMapper.class);
    @Override
    public ClickEvent map(String s) throws IOException {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.readValue(s, ClickEvent.class);
        } catch (Exception e) {
            LOG.error(e.getMessage());
            throw e;
        }
    }
}
