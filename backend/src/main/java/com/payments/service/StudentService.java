package com.payments.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import com.payments.model.*;
import com.payments.repository.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private GuardianRepository guardianRepository;
    
    @Autowired
    private MedicalRecordRepository medicalRecordRepository;
    
    @Autowired
    private AcademicRecordRepository academicRecordRepository;

    public Page<Student> getAllStudents(Pageable pageable, String searchTerm) {
        return studentRepository.findAllWithSearch(searchTerm, pageable);
    }
    
    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }
    
    public Optional<Student> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }
    
    public List<Student> getStudentsByEnrollmentStatus(String status) {
        return studentRepository.findByEnrollmentStatus(status);
    }
    
    public List<Student> getStudentsByGrade(String grade) {
        return studentRepository.findByCurrentGrade(grade);
    }

    
    @Transactional
    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }
    
    @Transactional
    public Student updateStudent(Long id, Student studentDetails) {
        Optional<Student> optionalStudent = studentRepository.findById(id);
        if (optionalStudent.isPresent()) {
            Student student = optionalStudent.get();
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            student.setPhone(studentDetails.getPhone());
            student.setDateOfBirth(studentDetails.getDateOfBirth());
            student.setGender(studentDetails.getGender());
            student.setAddress(studentDetails.getAddress());
            student.setEnrollmentStatus(studentDetails.getEnrollmentStatus());
            student.setCurrentGrade(studentDetails.getCurrentGrade());
            student.setSection(studentDetails.getSection());
            return studentRepository.save(student);
        }
        return null;
    }
    
    @Transactional
    public boolean deleteStudent(Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Guardian management
    public List<Guardian> getStudentGuardians(Long studentId) {
        return guardianRepository.findByStudentId(studentId);
    }
    
    @Transactional
    public Guardian addGuardian(Guardian guardian) {
        return guardianRepository.save(guardian);
    }
    
    @Transactional
    public Guardian updateGuardian(Long id, Guardian guardianDetails) {
        Optional<Guardian> optionalGuardian = guardianRepository.findById(id);
        if (optionalGuardian.isPresent()) {
            Guardian guardian = optionalGuardian.get();
            guardian.setFirstName(guardianDetails.getFirstName());
            guardian.setLastName(guardianDetails.getLastName());
            guardian.setRelationship(guardianDetails.getRelationship());
            guardian.setPrimaryPhone(guardianDetails.getPrimaryPhone());
            guardian.setSecondaryPhone(guardianDetails.getSecondaryPhone());
            guardian.setEmail(guardianDetails.getEmail());
            guardian.setOccupation(guardianDetails.getOccupation());
            guardian.setAddress(guardianDetails.getAddress());
            guardian.setPrimary(guardianDetails.isPrimary());
            guardian.setEmergencyContact(guardianDetails.isEmergencyContact());
            return guardianRepository.save(guardian);
        }
        return null;
    }
    
    // Medical records management
    public List<MedicalRecord> getStudentMedicalRecords(Long studentId) {
        return medicalRecordRepository.findByStudentId(studentId);
    }
    
    @Transactional
    public MedicalRecord addMedicalRecord(MedicalRecord medicalRecord) {
        return medicalRecordRepository.save(medicalRecord);
    }
    
    // Academic records management
    public List<AcademicRecord> getStudentAcademicRecords(Long studentId) {
        return academicRecordRepository.findByStudentId(studentId);
    }
    
    @Transactional
    public AcademicRecord addAcademicRecord(AcademicRecord academicRecord) {
        return academicRecordRepository.save(academicRecord);
    }
    
    public Long getStudentCountByStatus(String status) {
        return studentRepository.countByEnrollmentStatus(status);
    }

    @Transactional
    public List<Student> bulkAddStudents(MultipartFile file) throws IOException, CsvValidationException {
        List<Student> studentsToSave = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Invalid file type. Please upload a CSV or XLSX file.");
        }

        if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                csvReader.skip(1); // Skip header row
                String[] line;
                while ((line = csvReader.readNext()) != null) {
                    Student student = new Student();
                    student.setFirstName(line[0]);
                    student.setLastName(line[1]);
                    student.setEmail(line[2]);
                    student.setPhone(line[3]);
                    student.setDateOfBirth(parseDate(line[4])); // Use the new helper method
                    student.setGender(line[5]);
                    student.setAddress(line[6]);
                    student.setCurrentGrade(line[7]);
                    student.setSection(line[8]);
                    student.setEnrollmentStatus("ACTIVE");
                    student.setEnrollmentDate(LocalDate.now());
                    studentsToSave.add(student);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
            }
        } else { // XLSX
            try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                Sheet sheet = workbook.getSheetAt(0);
                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    Row row = sheet.getRow(i);
                    if (row == null) continue;
                    Student student = new Student();
                    student.setFirstName(getCellValueAsString(row.getCell(0)));
                    student.setLastName(getCellValueAsString(row.getCell(1)));
                    student.setEmail(getCellValueAsString(row.getCell(2)));
                    student.setPhone(getCellValueAsString(row.getCell(3)));
                    student.setDateOfBirth(parseDate(getCellValueAsString(row.getCell(4)))); // Use helper
                    student.setGender(getCellValueAsString(row.getCell(5)));
                    student.setAddress(getCellValueAsString(row.getCell(6)));
                    student.setCurrentGrade(getCellValueAsString(row.getCell(7)));
                    student.setSection(getCellValueAsString(row.getCell(8)));
                    student.setEnrollmentStatus("ACTIVE");
                    student.setEnrollmentDate(LocalDate.now());
                    studentsToSave.add(student);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
            }
        }

        if (studentsToSave.isEmpty()) { throw new IllegalArgumentException("File contains no student data to import."); }
        return studentRepository.saveAll(studentsToSave);
    }


    // --- NEW HELPER METHOD FOR FLEXIBLE DATE PARSING ---
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null; // Handle empty date cells
        }
        // List of common date formats to try
        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
        };

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Ignore and try the next format
            }
        }
        // If no format matches, throw an exception
        throw new DateTimeParseException("Unable to parse date: " + dateStr + ". Please use a supported format like yyyy-MM-dd or d/M/yyyy.", dateStr, 0);
    }

    // Helper method to safely get cell values from Excel as String
    private String getCellValueAsString(Cell cell) {
        if (cell == null) {
            return "";
        }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                // Handle numeric cells, could be dates or just numbers
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                } else {
                    return String.valueOf((long)cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }

}
