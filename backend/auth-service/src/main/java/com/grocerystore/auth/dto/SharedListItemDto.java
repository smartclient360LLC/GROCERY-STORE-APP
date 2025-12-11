package com.grocerystore.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedListItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal weight;
    private String notes;
    private Long addedByUserId;
    private String addedByName;
    private Boolean isChecked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

