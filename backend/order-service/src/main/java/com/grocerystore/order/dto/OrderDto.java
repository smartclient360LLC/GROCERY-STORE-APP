package com.grocerystore.order.dto;

import com.grocerystore.order.model.Order;
import com.grocerystore.order.model.ShippingAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private List<OrderItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private Order.PaymentMethod paymentMethod;
    private Boolean isPosOrder;
    private ShippingAddress shippingAddress;
    private BigDecimal carbonFootprintKg;
    private BigDecimal deliveryDistanceKm;
    private String packagingType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

