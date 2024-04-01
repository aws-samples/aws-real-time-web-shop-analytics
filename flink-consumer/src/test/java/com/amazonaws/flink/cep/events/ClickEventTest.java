package com.amazonaws.flink.cep.events;

import org.junit.jupiter.api.Test;

class ClickEventTest {

    @Test
    public void testAssertSerializedAsPojoWithoutKryo() {
        PojoTestUtils.assertSerializedAsPojoWithoutKryo(ClickEvent.class);
    }

}