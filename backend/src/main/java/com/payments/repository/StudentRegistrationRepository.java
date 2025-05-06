
package com.payments.repository;

import com.payments.model.StudentRegistration;
import com.payments.model.StudentRegistrationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRegistrationRepository extends JpaRepository<StudentRegistration, StudentRegistrationId> {
    List<StudentRegistration> findByIdBillerId(String billerId);
}
