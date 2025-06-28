package com.payments.service;

import com.payments.model.Timetable;
import com.payments.repository.TimetableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TimetableService {
    
    @Autowired
    private TimetableRepository timetableRepository;
    
    public List<Timetable> getAllTimetables() {
        return timetableRepository.findAll();
    }
    
    public Optional<Timetable> getTimetableById(Long id) {
        return timetableRepository.findById(id);
    }
    
    public List<Timetable> getTimetablesByGrade(String grade) {
        return timetableRepository.findByGrade(grade);
    }
    
    public List<Timetable> getTimetablesByGradeAndSection(String grade, String section) {
        return timetableRepository.findByGradeAndSection(grade, section);
    }
    
    public List<Timetable> getTimetablesByDay(String dayOfWeek) {
        return timetableRepository.findByDayOfWeek(dayOfWeek);
    }
    
    public List<Timetable> getTimetablesByTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }
    
    @Transactional
    public Timetable createTimetable(Timetable timetable) {
        return timetableRepository.save(timetable);
    }
    
    @Transactional
    public Timetable updateTimetable(Long id, Timetable timetableDetails) {
        Optional<Timetable> optionalTimetable = timetableRepository.findById(id);
        if (optionalTimetable.isPresent()) {
            Timetable timetable = optionalTimetable.get();
            timetable.setSubject(timetableDetails.getSubject());
            timetable.setTeacher(timetableDetails.getTeacher());
            timetable.setGrade(timetableDetails.getGrade());
            timetable.setSection(timetableDetails.getSection());
            timetable.setDayOfWeek(timetableDetails.getDayOfWeek());
            timetable.setStartTime(timetableDetails.getStartTime());
            timetable.setEndTime(timetableDetails.getEndTime());
            timetable.setRoom(timetableDetails.getRoom());
            timetable.setAcademicYear(timetableDetails.getAcademicYear());
            return timetableRepository.save(timetable);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteTimetable(Long id) {
        if (timetableRepository.existsById(id)) {
            timetableRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public int getTotalClassCount() {
        return (int) timetableRepository.countDistinctByGradeAndSection();
    }
    
    public int getActivePeriodCount() {
        return (int) timetableRepository.count();
    }
    
    public int getConflictCount() {
        return timetableRepository.findConflictCount();
    }
    
    public int getFreeSlotCount() {
        // Calculate free slots based on total possible slots minus occupied
        int totalPossibleSlots = 5 * 8; // 5 days * 8 periods per day
        int occupiedSlots = getActivePeriodCount();
        return Math.max(0, totalPossibleSlots - occupiedSlots);
    }
}
