
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
    
    @Transactional
    public Timetable saveTimetable(Timetable timetable) {
        return timetableRepository.save(timetable);
    }
    
    @Transactional
    public boolean deleteTimetable(Long id) {
        if (timetableRepository.existsById(id)) {
            timetableRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<Timetable> getTimetablesByGrade(String grade) {
        return timetableRepository.findByGrade(grade);
    }
    
    public List<Timetable> getTimetablesByTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }
    
    public List<Timetable> getTimetablesBySubject(String subject) {
        return timetableRepository.findBySubject(subject);
    }
}
