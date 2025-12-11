package com.grocerystore.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCarbonSummaryDto {
    private Long userId;
    private Integer totalOrders;
    private BigDecimal totalCarbonKg;
    private BigDecimal averageCarbonPerOrderKg;
    private BigDecimal minCarbonKg;
    private BigDecimal maxCarbonKg;
    private LocalDate firstOrderDate;
    private LocalDate lastOrderDate;
    private BigDecimal carbonSavedKg; // Compared to average user
    private String ecoBadge; // e.g., "Eco Warrior", "Green Shopper", etc.
    private List<MonthlyFootprint> monthlyFootprints;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyFootprint {
        private String month; // Format: "2024-01"
        private BigDecimal carbonKg;
        private Integer orderCount;
    }
}

