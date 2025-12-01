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
public class WishlistDto {
    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal currentPrice;
    private BigDecimal previousPrice; // Price when added to wishlist
    private BigDecimal lowestPrice; // Lowest price since added
    private Boolean inStock;
    private Boolean notifyOnPriceDrop;
    private Boolean notifyWhenInStock;
    private BigDecimal targetPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean priceDropped; // True if price dropped since added
    private BigDecimal priceDropAmount; // How much the price dropped
}

