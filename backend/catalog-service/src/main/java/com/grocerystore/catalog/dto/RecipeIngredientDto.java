package com.grocerystore.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredientDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private String notes;
    private Boolean inStock; // Will be populated by service to check availability
    private BigDecimal currentPrice; // Current product price
}

