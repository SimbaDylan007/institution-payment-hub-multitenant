package com.payments.dto;

public class HubAlertDto {
    private String text;
    private String value;
    private String icon; // Name of the Lucide icon for the frontend
    private String color; // Tailwind CSS color class

    public HubAlertDto(String text, String value, String icon, String color) {
        this.text = text;
        this.value = value;
        this.icon = icon;
        this.color = color;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}
