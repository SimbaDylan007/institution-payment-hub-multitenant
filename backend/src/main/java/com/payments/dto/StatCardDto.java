package com.payments.dto;

public class StatCardDto {
    private String title;
    private String value;
    private String change; // e.g., "+12%"
    private String icon;   // e.g., "Users"
    private String color;  // e.g., "text-blue-400"

    public StatCardDto(String title, String value, String change, String icon, String color) {
        this.title = title;
        this.value = value;
        this.change = change;
        this.icon = icon;
        this.color = color;
    }
    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public String getChange() { return change; }
    public void setChange(String change) { this.change = change; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}