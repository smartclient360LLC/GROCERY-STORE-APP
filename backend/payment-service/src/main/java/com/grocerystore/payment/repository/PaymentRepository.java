package com.grocerystore.payment.repository;

import com.grocerystore.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderNumber(String orderNumber);
    Optional<Payment> findByStripePaymentIntentId(String paymentIntentId);
}

