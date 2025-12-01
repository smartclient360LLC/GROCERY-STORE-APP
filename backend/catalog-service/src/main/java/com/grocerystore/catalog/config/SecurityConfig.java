package com.grocerystore.catalog.config;

import com.grocerystore.catalog.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public GET endpoints - anyone can view products and categories (MUST come first)
                .requestMatchers("GET", "/api/catalog/products").permitAll()
                .requestMatchers("GET", "/api/catalog/products/*").permitAll()  // /products/{id}
                .requestMatchers("GET", "/api/catalog/products/category/*").permitAll()  // /products/category/{id}
                .requestMatchers("GET", "/api/catalog/categories").permitAll()
                .requestMatchers("GET", "/api/catalog/categories/*").permitAll()  // /categories/{id}
                // Admin-only endpoints - require ADMIN role
                .requestMatchers("/api/catalog/products/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/catalog/products/*/admin").hasRole("ADMIN")
                .requestMatchers("POST", "/api/catalog/products", "/api/catalog/categories").hasRole("ADMIN")
                .requestMatchers("PUT", "/api/catalog/products/*", "/api/catalog/categories/*").hasRole("ADMIN")
                .requestMatchers("DELETE", "/api/catalog/products/*", "/api/catalog/categories/*").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

