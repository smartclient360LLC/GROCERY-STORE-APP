package com.grocerystore.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_execution_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderExecutionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_order_id", nullable = false)
    private ScheduledOrder scheduledOrder;
    
    @Column(name = "executed_order_id")
    private Long executedOrderId; // Link to actual order created
    
    @Column(name = "execution_date", nullable = false, updatable = false)
    private LocalDateTime executionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionStatus status;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @PrePersist
    protected void onCreate() {
        if (executionDate == null) {
            executionDate = LocalDateTime.now();
        }
    }
    
    public enum ExecutionStatus {
        SUCCESS, FAILED, SKIPPED
    }
}

