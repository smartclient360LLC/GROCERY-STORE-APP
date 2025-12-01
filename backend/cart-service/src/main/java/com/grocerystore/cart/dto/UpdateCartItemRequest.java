package com.grocerystore.cart.dto;

import lombok.Data;

@Data
public class UpdateCartItemRequest {
    private Integer quantity;
    private String weight;
}

