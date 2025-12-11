package com.grocerystore.order.dto;

import com.grocerystore.order.model.ScheduledOrder;
import com.grocerystore.order.model.ShippingAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateScheduledOrderRequest {
    @NotNull(message = "Order name is required")
    private String orderName;
    
    @NotNull(message = "Order type is required")
    private ScheduledOrder.OrderType orderType; // ONE_TIME or RECURRING
    
    private ScheduledOrder.RecurrenceType recurrenceType; // Required if RECURRING
    
    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;
    
    private LocalTime scheduledTime;
    
    private LocalDate deliveryDate; // Optional, defaults to scheduledDate
    
    private LocalTime deliveryTime;
    
    private LocalDate endDate; // For recurring orders
    
    private Integer maxOccurrences; // For recurring orders
    
    @NotNull(message = "Items are required")
    private List<CartItemSnapshot> items; // Cart items snapshot
    
    @NotNull(message = "Shipping address is required")
    private ShippingAddress shippingAddress;
    
    private String deliveryPoint;
    
    private String notes;
}

