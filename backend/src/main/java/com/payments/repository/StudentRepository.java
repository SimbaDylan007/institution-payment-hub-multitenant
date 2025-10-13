package com.payments.repository;

import com.payments.dto.StudentBalanceDto;
import com.payments.model.Institution; // <-- IMPORT
import com.payments.model.Student;
import com.payments.model.StudentCategory;
import com.payments.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);
    List<Student> findByEnrollmentStatus(String enrollmentStatus);
    List<Student> findByCurrentGrade(String currentGrade);
    List<Student> findByCategory(StudentCategory category);
    List<Student> findByCurrentGradeAndSection(String currentGrade, String section);
    Long countByEnrollmentStatus(String enrollmentStatus);
    Optional<Student> findByEmail(String email);
    List<Student> findByCurrentGradeAndInstitution(String gradeName, Institution institution);
    long countByInstitutionId(Long institutionId);

    @Query("SELECT s FROM Student s WHERE s.user = :user")
    Optional<Student> findByUser(@Param("user") User user);

    @Query("SELECT new com.payments.dto.StudentBalanceDto(s.id, s.studentId, s.firstName, s.lastName, s.currentGrade, s.category) FROM Student s")
    List<StudentBalanceDto> findAllStudentInfoForBalanceDto();

    @Query("SELECT new com.payments.dto.StudentBalanceDto(s.id, s.studentId, s.firstName, s.lastName, s.currentGrade, s.category) FROM Student s WHERE s.institution.id = :institutionId")
    List<StudentBalanceDto> findAllStudentInfoForBalanceDtoByInstitution(@Param("institutionId") Long institutionId);

    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Student> findAllWithSearch(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE s.institution.id = :institutionId AND (" +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Student> findAllByInstitutionIdAndSearch(@Param("institutionId") Long institutionId, @Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT s FROM Student s WHERE " +
            "(:grade IS NULL OR :grade = 'All' OR s.currentGrade = :grade) AND " +
            "(:section IS NULL OR :section = 'All' OR :section = '' OR s.section = :section)")
    List<Student> findWithFilters(@Param("grade") String grade, @Param("section") String section);

    boolean existsByCategoryId(Long categoryId);

    boolean existsByInstitutionId(Long institutionId);

    Optional<Student> findByStudentIdAndInstitution(String studentId, Institution institution);
}