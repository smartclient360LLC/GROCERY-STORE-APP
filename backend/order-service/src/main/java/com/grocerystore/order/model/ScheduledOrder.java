package com.grocerystore.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "scheduled_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "order_name")
    private String orderName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false)
    private OrderType orderType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type")
    private RecurrenceType recurrenceType;
    
    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;
    
    @Column(name = "scheduled_time")
    private LocalTime scheduledTime;
    
    @Column(name = "delivery_date")
    private LocalDate deliveryDate;
    
    @Column(name = "delivery_time")
    private LocalTime deliveryTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ScheduledOrderStatus status = ScheduledOrderStatus.PENDING;
    
    @Column(name = "next_execution_date")
    private LocalDate nextExecutionDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "max_occurrences")
    private Integer maxOccurrences;
    
    @Column(name = "current_occurrence")
    @Builder.Default
    private Integer currentOccurrence = 0;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "cart_snapshot", columnDefinition = "JSONB")
    private String cartSnapshot; // JSON string of cart items
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "shipping_address", columnDefinition = "JSONB")
    private String shippingAddress; // JSON string of shipping address
    
    @Column(name = "delivery_point")
    private String deliveryPoint;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "scheduledOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ScheduledOrderItem> items;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (nextExecutionDate == null && scheduledDate != null) {
            nextExecutionDate = scheduledDate;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum OrderType {
        ONE_TIME, RECURRING
    }
    
    public enum RecurrenceType {
        DAILY, WEEKLY, MONTHLY
    }
    
    public enum ScheduledOrderStatus {
        PENDING, ACTIVE, COMPLETED, CANCELLED, PAUSED
    }
}

