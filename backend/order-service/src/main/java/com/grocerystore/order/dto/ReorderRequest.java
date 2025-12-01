package com.grocerystore.order.dto;

import lombok.Data;

@Data
public class ReorderRequest {
    private Long orderId;
    private Long userId;
}

