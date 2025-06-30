package com.payments.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.payments.repository.StudentRepository;
import com.payments.repository.StaffRepository;
import com.payments.repository.BookRepository;
import com.payments.repository.FeeRepository;
import com.payments.repository.EventRepository;
import com.payments.repository.TimetableRepository;

import com.payments.model.Event;
import java.util.List;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StudentRepository studentRepository;
    private final StaffRepository staffRepository;
    private final BookRepository bookRepository;
    private final FeeRepository feeRepository;
    private final EventRepository eventRepository;
    private final TimetableRepository timetableRepository;

    // Constructor Injection
    public StatsController(
            StudentRepository studentRepository,
            StaffRepository staffRepository,
            BookRepository bookRepository,
            FeeRepository feeRepository,
            EventRepository eventRepository,
            TimetableRepository timetableRepository
    ) {
        this.studentRepository = studentRepository;
        this.staffRepository = staffRepository;
        this.bookRepository = bookRepository;
        this.feeRepository = feeRepository;
        this.eventRepository = eventRepository;
        this.timetableRepository = timetableRepository;
    }

    @GetMapping("/students/count")
    public ResponseEntity<Map<String, Object>> getStudentCount() {
        Map<String, Object> result = new HashMap<>();
        long count = studentRepository.count();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/staff/count")
    public ResponseEntity<Map<String, Object>> getStaffCount() {
        Map<String, Object> result = new HashMap<>();
        long count = staffRepository.count();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/library/books/count")
    public ResponseEntity<Map<String, Object>> getLibraryBooksCount() {
        Map<String, Object> result = new HashMap<>();
        long count = bookRepository.count();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/fees/total-collected")
    public ResponseEntity<Map<String, Object>> getTotalFeesCollected() {
        Map<String, Object> result = new HashMap<>();
        Optional<BigDecimal> totalCollectedOptional = feeRepository.findTotalFeesCollected();
        BigDecimal totalCollected = totalCollectedOptional.orElse(BigDecimal.ZERO);

        result.put("amount", totalCollected);
        result.put("currency", "USD");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/events/current-month/count")
    public ResponseEntity<Map<String, Object>> getCurrentMonthEventsCount() {
        Map<String, Object> result = new HashMap<>();
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());


        List<Event> eventsInMonth = eventRepository.findByEventDateBetween(startOfMonth, endOfMonth);
        long count = eventsInMonth.size(); // 'count' is declared and assigned here.

        result.put("count", count);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/timetables/classes/count")
    public ResponseEntity<Map<String, Object>> getTimetableClassesCount() {
        Map<String, Object> result = new HashMap<>();
        long count = timetableRepository.count();
        result.put("count", count);
        return ResponseEntity.ok(result);
    }
}