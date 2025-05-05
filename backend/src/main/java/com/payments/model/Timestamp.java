
package com.payments.model;

import lombok.Data;

@Data
public class Timestamp {
    private int date;
    private int day;
    private int hours;
    private int minutes;
    private int month;
    private int nanos;
    private int seconds;
    private long time;
    private int timezoneOffset;
    private int year;
}
