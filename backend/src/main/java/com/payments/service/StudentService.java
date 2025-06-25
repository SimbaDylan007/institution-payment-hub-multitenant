
package com.payments.service;

import com.payments.model.Student;
import com.payments.model.Guardian;
import com.payments.model.MedicalRecord;
import com.payments.model.AcademicRecord;
import com.payments.repository.StudentRepository;
import com.payments.repository.GuardianRepository;
import com.payments.repository.MedicalRecordRepository;
import com.payments.repository.AcademicRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
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
    
    public List<Student> searchStudentsByName(String name) {
        return studentRepository.findByNameContaining(name);
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
}
