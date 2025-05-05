
package com.payments.repository;

import com.payments.model.PaymentAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentAlert, String> {
    List<PaymentAlert> findByStatus(String status);
}
