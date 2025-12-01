package com.grocerystore.payment.service;

import com.grocerystore.payment.dto.PaymentIntentRequest;
import com.grocerystore.payment.dto.PaymentIntentResponse;
import com.grocerystore.payment.model.Payment;
import com.grocerystore.payment.repository.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    
    @Value("${spring.rabbitmq.template.exchange:payment-exchange}")
    private String exchange;
    
    @Value("${spring.rabbitmq.template.routing-key:payment.succeeded}")
    private String routingKey;
    
    @Transactional
    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        log.info("Creating payment intent for order: {}, userId: {}, amount: {}", 
            request.getOrderNumber(), request.getUserId(), request.getAmount());
        
        // Validate amount
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }
        
        // Convert amount to cents (Stripe uses smallest currency unit)
        long amountInCents = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        
        if (amountInCents < 50) {
            throw new IllegalArgumentException("Payment amount must be at least $0.50 (Stripe minimum)");
        }
        
        log.info("Creating Stripe payment intent with amount: {} cents", amountInCents);
        
        // Create PaymentIntent with automatic payment methods
        // Note: When using automatic_payment_methods, we cannot set confirmation_method
        // Automatic payment methods already handles 3D Secure (SCA) automatically
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(request.getCurrency())
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .setConfirm(false) // We'll confirm on the frontend
                .putMetadata("orderNumber", request.getOrderNumber())
                .putMetadata("userId", request.getUserId().toString())
                .build();
        
        PaymentIntent paymentIntent = PaymentIntent.create(params);
        
        // Save payment record
        Payment payment = Payment.builder()
                .orderNumber(request.getOrderNumber())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .status(Payment.PaymentStatus.PENDING)
                .stripePaymentIntentId(paymentIntent.getId())
                .build();
        paymentRepository.save(payment);
        
        return PaymentIntentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentIntentId(paymentIntent.getId())
                .orderNumber(request.getOrderNumber())
                .build();
    }
    
    @Transactional
    public void handlePaymentSuccess(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(Payment.PaymentStatus.SUCCEEDED);
        paymentRepository.save(payment);
        
        // Publish payment succeeded event
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("orderNumber", payment.getOrderNumber());
        eventData.put("paymentId", payment.getId());
        rabbitTemplate.convertAndSend(exchange, routingKey, eventData);
    }
    
    @Transactional
    public void handlePaymentFailure(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);
    }
    
    public Payment getPaymentByOrderNumber(String orderNumber) {
        return paymentRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}

