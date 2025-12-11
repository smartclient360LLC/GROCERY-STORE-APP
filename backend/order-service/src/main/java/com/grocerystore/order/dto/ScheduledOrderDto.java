package com.grocerystore.order.dto;

import com.grocerystore.order.model.ScheduledOrder;
import com.grocerystore.order.model.ShippingAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduledOrderDto {
    private Long id;
    private Long userId;
    private String orderName;
    private ScheduledOrder.OrderType orderType;
    private ScheduledOrder.RecurrenceType recurrenceType;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private LocalDate deliveryDate;
    private LocalTime deliveryTime;
    private ScheduledOrder.ScheduledOrderStatus status;
    private LocalDate nextExecutionDate;
    private LocalDate endDate;
    private Integer maxOccurrences;
    private Integer currentOccurrence;
    private List<ScheduledOrderItemDto> items;
    private ShippingAddress shippingAddress;
    private String deliveryPoint;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

