package com.payments.repository;

import com.payments.model.Guardian;
import com.payments.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, Long> {
    List<Guardian> findByStudentId(Long studentId);

    // NEW METHOD: Finds all guardians linked to a list of student entities.
    List<Guardian> findByStudentIn(List<Student> students);
}