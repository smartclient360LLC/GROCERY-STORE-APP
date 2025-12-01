package com.grocerystore.auth.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate BCrypt password hashes for seed data
 * Run this main method to generate hashes for passwords
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Password Hashes:");
        System.out.println("admin123: " + encoder.encode("admin123"));
        System.out.println("customer123: " + encoder.encode("customer123"));
    }
}

