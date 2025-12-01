package com.grocerystore.payment.controller;

import com.grocerystore.payment.dto.PaymentIntentRequest;
import com.grocerystore.payment.dto.PaymentIntentResponse;
import com.grocerystore.payment.model.Payment;
import com.grocerystore.payment.service.PaymentService;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @Value("${stripe.webhook-secret}")
    private String webhookSecret;
    
    @PostMapping("/create-intent")
    public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody PaymentIntentRequest request) {
        log.info("Received payment intent request - orderNumber: {}, userId: {}, amount: {}, currency: {}", 
            request.getOrderNumber(), request.getUserId(), request.getAmount(), request.getCurrency());
        try {
            // Validate amount before processing
            if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid amount");
                errorResponse.put("message", "Amount must be greater than zero");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Stripe minimum amount is $0.50 (50 cents)
            if (request.getAmount().compareTo(new java.math.BigDecimal("0.50")) < 0) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Amount too small");
                errorResponse.put("message", "Minimum payment amount is $0.50");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            return ResponseEntity.ok(paymentService.createPaymentIntent(request));
        } catch (StripeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Stripe error");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "Payment processing failed");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal error");
            errorResponse.put("message", e.getMessage() != null ? e.getMessage() : "An unexpected error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            
            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new RuntimeException("Payment intent not found"));
                paymentService.handlePaymentSuccess(paymentIntent.getId());
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElseThrow(() -> new RuntimeException("Payment intent not found"));
                paymentService.handlePaymentFailure(paymentIntent.getId());
            }
            
            return ResponseEntity.ok("Webhook processed");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }
    
    @GetMapping("/order/{orderNumber}")
    public ResponseEntity<Payment> getPaymentByOrderNumber(@PathVariable String orderNumber) {
        try {
            return ResponseEntity.ok(paymentService.getPaymentByOrderNumber(orderNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

