package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.dto.*;
import com.payments.model.*;
import com.payments.repository.*;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired private ScheduleEventRepository scheduleEventRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<ScheduleEvent> getEventsForMonth(int year, int month, Long institutionId) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        User currentUser = getCurrentUser();
        boolean isSuperAdmin = isSuperAdmin(currentUser);

        if (isSuperAdmin && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return scheduleEventRepository.findByInstitutionIdAndDateRange(institutionId, start, end);
        }
        return scheduleEventRepository.findByDateRange(start, end);
    }

    @Transactional
    public ScheduleEvent createOrUpdateEvent(ScheduleEvent event) {
        if (event.getId() == null) {
            User currentUser = getCurrentUser();
            Institution institution = currentUser.getInstitution();
            if (institution == null && !isSuperAdmin(currentUser)) {
                throw new IllegalStateException("User does not belong to an institution and cannot create events.");
            }
            if (event.getInstitution() == null) {
                event.setInstitution(institution);
            }
        }
        return scheduleEventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        if (scheduleEventRepository.existsById(eventId)) {
            scheduleEventRepository.deleteById(eventId);
        } else {
            throw new RuntimeException("Event not found or you do not have permission to delete it.");
        }
    }

    @Transactional
    public void bulkImportTimetable(MultipartFile file, String academicYear, Long institutionIdOverride) throws IOException, CsvValidationException {
        User currentUser = getCurrentUser();
        Institution targetInstitution;

        if (isSuperAdmin(currentUser) && institutionIdOverride != null) {
            targetInstitution = entityManager.find(Institution.class, institutionIdOverride);
            if (targetInstitution == null) throw new IllegalArgumentException("Invalid institution ID provided for bulk import.");
        } else {
            targetInstitution = currentUser.getInstitution();
            if (targetInstitution == null) {
                throw new IllegalStateException("You must belong to an institution to bulk import a timetable.");
            }
        }

        List<ScheduleEvent> eventsToSave = new ArrayList<>();
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            csvReader.skip(1);
            String[] line;
            while ((line = csvReader.readNext()) != null) {
                String grade = line[0];
                String section = line[1];
                DayOfWeek dayOfWeek = DayOfWeek.valueOf(line[2].toUpperCase());
                LocalTime startTime = LocalTime.parse(line[3]);
                LocalTime endTime = LocalTime.parse(line[4]);
                String subjectCode = line[5];
                String subjectTitle = subjectRepository.findByCodeAndInstitution(subjectCode, targetInstitution)
                        .map(Subject::getName)
                        .orElse(subjectCode);
                String teacherName = line[6];
                String room = line[7];
                LocalDate eventDate = findNextDateForDay(dayOfWeek);

                ScheduleEvent event = new ScheduleEvent();
                event.setTitle(subjectTitle);
                event.setInstitution(targetInstitution);
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

    private LocalDate findNextDateForDay(DayOfWeek day) {
        LocalDate result = LocalDate.now();
        while (result.getDayOfWeek() != day) {
            result = result.plusDays(1);
        }
        return result;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }

    public ScheduleStatsDto getScheduleStats(Long institutionId) {
        User currentUser = getCurrentUser();
        boolean isSuperAdmin = isSuperAdmin(currentUser);

        if (isSuperAdmin && institutionId != null) {
            Institution institution = entityManager.find(Institution.class, institutionId);
            if (institution == null) return new ScheduleStatsDto(0,0,0);

            long totalClasses = scheduleEventRepository.countByInstitutionAndEventType(institution, ScheduleEventType.CLASS);
            long totalExams = scheduleEventRepository.countByInstitutionAndEventType(institution, ScheduleEventType.EXAM);
            long totalEvents = scheduleEventRepository.countByInstitutionAndEventType(institution, ScheduleEventType.EVENT);
            return new ScheduleStatsDto(totalClasses, totalExams, totalEvents);
        }

        long totalClasses = scheduleEventRepository.countByEventType(ScheduleEventType.CLASS);
        long totalExams = scheduleEventRepository.countByEventType(ScheduleEventType.EXAM);
        long totalEvents = scheduleEventRepository.countByEventType(ScheduleEventType.EVENT);
        return new ScheduleStatsDto(totalClasses, totalExams, totalEvents);
    }
}