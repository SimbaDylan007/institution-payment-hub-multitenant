package com.payments.dto;

public class QuickActionDto {
    private String text;
    private String link; // Frontend route
    private String icon;

    public QuickActionDto(String text, String link, String icon) {
        this.text = text;
        this.link = link;
        this.icon = icon;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}
