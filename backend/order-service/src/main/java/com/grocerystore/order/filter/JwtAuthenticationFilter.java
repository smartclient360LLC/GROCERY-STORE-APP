package com.grocerystore.order.filter;

import com.grocerystore.order.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No Authorization header found for request: " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            final String token = authHeader.substring(7);
            logger.debug("Extracting token for request: " + request.getRequestURI());
            
            final String username = jwtUtil.extractUsername(token);
            final String role = jwtUtil.extractRole(token);
            
            logger.debug("Extracted username: " + username + ", role: " + role);
            
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                if (jwtUtil.validateToken(token)) {
                    logger.debug("Token is valid, setting authentication");
                    // Create authorities from role
                    List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                            new SimpleGrantedAuthority("ROLE_" + role)
                    );
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication set successfully for user: " + username);
                } else {
                    logger.warn("Token validation failed for request: " + request.getRequestURI());
                }
            } else {
                logger.debug("Username is null or authentication already exists");
            }
        } catch (Exception e) {
            // Token is invalid, log the error but continue
            logger.error("JWT authentication failed for request " + request.getRequestURI() + ": " + e.getMessage(), e);
            logger.error("Exception type: " + e.getClass().getName());
            if (e.getCause() != null) {
                logger.error("Cause: " + e.getCause().getMessage());
            }
            // Don't set authentication, let Spring Security handle it
        }
        
        filterChain.doFilter(request, response);
    }
}

