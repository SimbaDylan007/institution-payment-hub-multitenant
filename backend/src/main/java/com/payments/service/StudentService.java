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
import org.hibernate.Session;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
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

    @Autowired
    private StudentCategoryRepository studentCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public Page<Student> getAllStudents(Pageable pageable, String searchTerm, Long institutionId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (isSuperAdmin && institutionId != null) {
            Session session = entityManager.unwrap(Session.class);
            session.disableFilter("institutionFilter");
            return studentRepository.findAllByInstitutionIdAndSearch(institutionId, searchTerm, pageable);
        }

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
        User currentUser = getCurrentUser();
        Institution institution = currentUser.getInstitution();
        if (institution == null && !isSuperAdmin(currentUser)) {
            throw new IllegalStateException("User does not belong to an institution and cannot create students.");
        }

        if (student.getInstitution() == null) {
            student.setInstitution(institution);
        }

        return studentRepository.save(student);
    }


    public Student updateStudent(Long id, Student studentDetails) {

        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));


        if (studentDetails.getInstitution() != null &&
                !studentDetails.getInstitution().getId().equals(existingStudent.getInstitution().getId())) {
            throw new SecurityException("Updating a student's institution is not allowed. Please use a dedicated transfer process.");
        }

        existingStudent.setFirstName(studentDetails.getFirstName());
        existingStudent.setLastName(studentDetails.getLastName());
        existingStudent.setEmail(studentDetails.getEmail());
        existingStudent.setPhone(studentDetails.getPhone());
        existingStudent.setDateOfBirth(studentDetails.getDateOfBirth());
        existingStudent.setGender(studentDetails.getGender());
        existingStudent.setAddress(studentDetails.getAddress());
        existingStudent.setEnrollmentStatus(studentDetails.getEnrollmentStatus());
        existingStudent.setCurrentGrade(studentDetails.getCurrentGrade());
        existingStudent.setSection(studentDetails.getSection());
        existingStudent.setCategory(studentDetails.getCategory());

        return studentRepository.save(existingStudent);
    }

    @Transactional
    public boolean deleteStudent(Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return true;
        }
        return false;
    }

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
    public List<Student> bulkAddStudents(MultipartFile file, Long institutionIdOverride) throws IOException, CsvValidationException {
        User currentUser = getCurrentUser();
        Institution targetInstitution;

        if (isSuperAdmin(currentUser) && institutionIdOverride != null) {
            targetInstitution = entityManager.find(Institution.class, institutionIdOverride);
            if (targetInstitution == null) throw new IllegalArgumentException("Invalid institution ID provided for bulk import.");
        } else {
            targetInstitution = currentUser.getInstitution();
            if (targetInstitution == null) {
                throw new IllegalStateException("You must belong to an institution to bulk import students.");
            }
        }

        StudentCategory defaultCategory = studentCategoryRepository.findByNameAndInstitution("OTHER", targetInstitution)
                .orElseThrow(() -> new RuntimeException("Default 'OTHER' category not found for the institution. Please create it in the settings."));

        List<Student> studentsToSave = new ArrayList<>();
        String filename = file.getOriginalFilename();

        if (filename == null || (!filename.endsWith(".csv") && !filename.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Invalid file type. Please upload a CSV or XLSX file.");
        }

        if (filename.endsWith(".csv")) {
            try (Reader reader = new InputStreamReader(file.getInputStream());
                 CSVReader csvReader = new CSVReader(reader)) {
                csvReader.skip(1);
                String[] line;
                while ((line = csvReader.readNext()) != null) {
                    Student student = new Student();
                    student.setFirstName(line[0]);
                    student.setLastName(line[1]);
                    student.setEmail(line[2]);
                    student.setPhone(line[3]);
                    student.setDateOfBirth(parseDate(line[4]));
                    student.setGender(line[5]);
                    student.setAddress(line[6]);
                    student.setCurrentGrade(line[7]);
                    student.setSection(line[8]);
                    student.setInstitution(targetInstitution);

                    String categoryName = line[9].trim().toUpperCase();
                    StudentCategory category = studentCategoryRepository.findByNameAndInstitution(categoryName, targetInstitution)
                            .orElse(defaultCategory);
                    student.setCategory(category);

                    student.setEnrollmentStatus("ACTIVE");
                    student.setEnrollmentDate(LocalDate.now());
                    studentsToSave.add(student);
                }
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
            }
        } else {
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
                    student.setDateOfBirth(parseDate(getCellValueAsString(row.getCell(4))));
                    student.setGender(getCellValueAsString(row.getCell(5)));
                    student.setAddress(getCellValueAsString(row.getCell(6)));
                    student.setCurrentGrade(getCellValueAsString(row.getCell(7)));
                    student.setSection(getCellValueAsString(row.getCell(8)));
                    student.setInstitution(targetInstitution);

                    String categoryName = getCellValueAsString(row.getCell(9)).trim().toUpperCase();
                    StudentCategory category = studentCategoryRepository.findByNameAndInstitution(categoryName, targetInstitution)
                            .orElse(defaultCategory);
                    student.setCategory(category);

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

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User)) {
            throw new IllegalStateException("User not authenticated.");
        }
        String username = ((org.springframework.security.core.userdetails.User) authentication.getPrincipal()).getUsername();
        return userRepository.findByUsername(username).orElseThrow(() -> new IllegalStateException("Authenticated user not found in database."));
    }

    private boolean isSuperAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_SUPER_ADMIN"));
    }


    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) { return null; }
        DateTimeFormatter[] formatters = new DateTimeFormatter[]{
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("d/M/yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("M/d/yyyy"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
        };
        for (DateTimeFormatter formatter : formatters) {
            try { return LocalDate.parse(dateStr, formatter); } catch (DateTimeParseException e) { /* continue */ }
        }
        throw new DateTimeParseException("Unable to parse date: " + dateStr, dateStr, 0);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) { return ""; }
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);
                } else {
                    return new java.text.DecimalFormat("0").format(cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue()).trim();
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return cell.getCellFormula();
                }
            default:
                return "";
        }
    }
}