package com.grocerystore.catalog.dto;

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
public class PriceHistoryDto {
    private Long id;
    private Long productId;
    private BigDecimal price;
    private LocalDateTime recordedAt;
}

