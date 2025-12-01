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
public class ProductSubstitutionDto {
    private ProductDto product;
    private String reason; // Why this is a good substitution (e.g., "Same category", "Similar price", "Similar name")
    private BigDecimal priceDifference; // Price difference from original product
    private Double similarityScore; // 0.0 to 1.0, higher is better match
}

