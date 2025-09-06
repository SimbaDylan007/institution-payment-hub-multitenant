package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.*;
import com.payments.repository.ScheduleEventRepository;
import com.payments.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import com.payments.dto.ScheduleStatsDto;

@Service
public class ScheduleService {

    @Autowired private ScheduleEventRepository scheduleEventRepository;
    @Autowired private SubjectRepository subjectRepository;

    public List<ScheduleEvent> getEventsForMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return scheduleEventRepository.findByDateRange(start, end);
    }

    @Transactional
    public ScheduleEvent createOrUpdateEvent(ScheduleEvent event) {
        return scheduleEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        scheduleEventRepository.deleteById(eventId);
    }

    @Transactional
    public void bulkImportTimetable(MultipartFile file, String academicYear) throws IOException, CsvValidationException {
        List<ScheduleEvent> eventsToSave = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1); // Skip header
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                // Assuming CSV format: grade,section,dayOfWeek,startTime,endTime,subjectCode,teacherName,room
                String grade = line[0];
                String section = line[1];
                DayOfWeek dayOfWeek = DayOfWeek.valueOf(line[2].toUpperCase());
                LocalTime startTime = LocalTime.parse(line[3]);
                LocalTime endTime = LocalTime.parse(line[4]);
                String subjectCode = line[5];
                String teacherName = line[6];
                String room = line[7];

                // Find subject to get the title
                String subjectTitle = subjectRepository.findByCode(subjectCode)
                        .map(Subject::getName)
                        .orElse(subjectCode);

                // This is a simple example; a real implementation would generate for the entire term
                LocalDate eventDate = findNextDateForDay(dayOfWeek);

                ScheduleEvent event = new ScheduleEvent();
                event.setTitle(subjectTitle);
                event.setEventType(ScheduleEventType.CLASS);
                event.setStartDate(eventDate);
                event.setStartTime(startTime);
                event.setEndTime(endTime);
                event.setGrade(grade);
                event.setSection(section);
                event.setSubjectCode(subjectCode);
                event.setTeacherName(teacherName);
                event.setRoom(room);
                eventsToSave.add(event);
            }
        }
        scheduleEventRepository.saveAll(eventsToSave);
    }

    // Helper to find the next occurrence of a specific day of the week
    private LocalDate findNextDateForDay(DayOfWeek day) {
        LocalDate result = LocalDate.now();
        while (result.getDayOfWeek() != day) {
            result = result.plusDays(1);
        }
        return result;
    }

    public ScheduleStatsDto getScheduleStats() {
        long totalClasses = scheduleEventRepository.countByEventType(ScheduleEventType.CLASS);
        long totalExams = scheduleEventRepository.countByEventType(ScheduleEventType.EXAM);
        long totalEvents = scheduleEventRepository.countByEventType(ScheduleEventType.EVENT);
        return new ScheduleStatsDto(totalClasses, totalExams, totalEvents);
    }
}