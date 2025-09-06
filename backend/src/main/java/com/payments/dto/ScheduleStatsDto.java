package com.payments.dto;

import lombok.Data;

@Data
public class ScheduleStatsDto {
    private long totalClasses;
    private long totalExams;
    private long totalEvents;
    // You can add more complex stats here later, like conflicts or free slots.

    public ScheduleStatsDto(long totalClasses, long totalExams, long totalEvents) {
        this.totalClasses = totalClasses;
        this.totalExams = totalExams;
        this.totalEvents = totalEvents;
    }
}