package com.amazonaws.flink.cep.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public final class GsonUtils {
    private static transient Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd HH:mm:ss.SSS").create();
    public static <T> String toJson(T objToConvert){

        return gson.toJson(objToConvert);
    }

}
