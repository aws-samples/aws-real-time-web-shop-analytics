package com.amazonaws.flink.cep.events;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Objects;

public class ClickEvent {
    @JsonProperty("session_id")
    private int sessionId;
    @JsonProperty("user_id")
    private String userId;
    @JsonProperty("product_id")
    private String productId;

    @JsonProperty("action_type")
    private String actionType;

    @JsonProperty("date_time")
    private long dateTime;

    public ClickEvent() {
    }

    public ClickEvent(int sessionId, String userId, String productId, String actionType, long dateTime) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.productId = productId;
        this.actionType = actionType;
        this.dateTime = dateTime;
    }

    public int getSessionId() {
        return sessionId;
    }

    public void setSessionId(int sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public long getDateTime() {
        return dateTime;
    }

    public void setDateTime(Long dateTime) {
        this.dateTime = dateTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ClickEvent that = (ClickEvent) o;

        return sessionId == that.sessionId &&
                userId.equals(that.userId) &&
                productId.equals(that.productId) &&
                dateTime == that.dateTime &&
                actionType.equals(that.actionType);
    }

    @Override
    public int hashCode() {
        return Objects.hash(sessionId, userId, productId, dateTime, actionType);
    }

    @Override
    public String toString() {
        return "ClickEvent{" +
                "sessionId=" + sessionId +
                ", userId='" + userId + '\'' +
                ", productId='" + productId + '\'' +
                ", actionType='" + actionType + '\'' +
                ", dateTime=" + dateTime +
                '}';
    }
}


