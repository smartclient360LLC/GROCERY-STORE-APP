package com.grocerystore.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonFootprintDto {
    private BigDecimal carbonFootprintKg;
    private BigDecimal deliveryDistanceKm;
    private String packagingType;
    private CarbonBreakdown breakdown;
    private List<CategoryFootprint> categoryFootprints;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CarbonBreakdown {
        private BigDecimal productFootprintKg; // CO2 from products
        private BigDecimal deliveryFootprintKg; // CO2 from delivery
        private BigDecimal packagingFootprintKg; // CO2 from packaging
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryFootprint {
        private String categoryName;
        private BigDecimal carbonFootprintKg;
        private Integer itemCount;
    }
}

