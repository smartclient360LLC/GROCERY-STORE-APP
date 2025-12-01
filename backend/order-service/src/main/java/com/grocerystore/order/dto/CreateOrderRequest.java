package com.grocerystore.order.dto;

import com.grocerystore.order.model.Order.PaymentMethod;
import com.grocerystore.order.model.ShippingAddress;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull(message = "User ID is required")
    private Long userId;
    
    @NotEmpty(message = "Order items are required")
    private List<OrderItemDto> items;
    
    @Valid
    private ShippingAddress shippingAddress;
    
    private PaymentMethod paymentMethod;
    
    private Boolean isPosOrder = false;
}

