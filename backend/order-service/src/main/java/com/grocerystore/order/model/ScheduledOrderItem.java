package com.grocerystore.order.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "scheduled_order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_order_id", nullable = false)
    private ScheduledOrder scheduledOrder;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(name = "product_name", nullable = false)
    private String productName;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal weight; // For weight-based items
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
}

