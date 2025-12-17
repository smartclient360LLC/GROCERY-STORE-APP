package com.grocerystore.payment;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class PaymentServiceApplication {
    
    @Value("${stripe.secret-key}")
    private String stripeSecretKey;
    
    @PostConstruct
    public void init() {
        // Validate Stripe secret key is provided and not a placeholder
        if (stripeSecretKey == null || stripeSecretKey.trim().isEmpty()) {
            throw new IllegalStateException(
                "STRIPE_SECRET_KEY environment variable is required but not set. " +
                "Please provide a valid Stripe secret key (starts with sk_test_ or sk_live_)"
            );
        }
        
        // Validate key format (must start with sk_test_ or sk_live_)
        if (!stripeSecretKey.startsWith("sk_test_") && !stripeSecretKey.startsWith("sk_live_")) {
            throw new IllegalStateException(
                "Invalid Stripe secret key format. " +
                "Key must start with 'sk_test_' (test mode) or 'sk_live_' (live mode). " +
                "Current value appears to be invalid or a placeholder."
            );
        }
        
        // Validate key is not a placeholder
        if (stripeSecretKey.contains("placeholder") || 
            stripeSecretKey.contains("your_stripe") || 
            stripeSecretKey.contains("your_stripe_secret_key") ||
            stripeSecretKey.equals("REQUIRED_SET_STRIPE_SECRET_KEY")) {
            throw new IllegalStateException(
                "Invalid Stripe secret key: placeholder value detected. " +
                "Please provide a valid Stripe secret key from your Stripe dashboard. " +
                "Set STRIPE_SECRET_KEY environment variable with a real key."
            );
        }
        
        Stripe.apiKey = stripeSecretKey;
        log.info("Stripe API key configured successfully (key starts with: {})", 
                 stripeSecretKey.substring(0, Math.min(10, stripeSecretKey.length())) + "...");
    }
    
    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}

