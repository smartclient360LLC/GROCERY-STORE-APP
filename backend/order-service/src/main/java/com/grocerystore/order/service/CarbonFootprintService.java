package com.grocerystore.order.service;

import com.grocerystore.order.dto.CarbonFootprintDto;
import com.grocerystore.order.dto.UserCarbonSummaryDto;
import com.grocerystore.order.model.CarbonFootprintHistory;
import com.grocerystore.order.model.Order;
import com.grocerystore.order.model.OrderItem;
import com.grocerystore.order.repository.CarbonFootprintHistoryRepository;
import com.grocerystore.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarbonFootprintService {
    
    private final OrderRepository orderRepository;
    private final CarbonFootprintHistoryRepository carbonFootprintHistoryRepository;
    
    // Carbon footprint factors (kg CO2 per kg of product)
    private static final Map<String, BigDecimal> CATEGORY_EMISSION_FACTORS = new HashMap<>();
    
    static {
        // Based on average CO2 emissions per kg of food product
        CATEGORY_EMISSION_FACTORS.put("Meat", new BigDecimal("27.0")); // Highest
        CATEGORY_EMISSION_FACTORS.put("Dairy", new BigDecimal("3.2"));
        CATEGORY_EMISSION_FACTORS.put("Fruits", new BigDecimal("0.4"));
        CATEGORY_EMISSION_FACTORS.put("Vegetables", new BigDecimal("0.4"));
        CATEGORY_EMISSION_FACTORS.put("Fruits & Vegetables", new BigDecimal("0.4"));
        CATEGORY_EMISSION_FACTORS.put("Grains", new BigDecimal("0.5"));
        CATEGORY_EMISSION_FACTORS.put("Beverages", new BigDecimal("0.3"));
        CATEGORY_EMISSION_FACTORS.put("Snacks", new BigDecimal("2.0"));
        CATEGORY_EMISSION_FACTORS.put("Frozen", new BigDecimal("1.5"));
        CATEGORY_EMISSION_FACTORS.put("Canned", new BigDecimal("1.2"));
        CATEGORY_EMISSION_FACTORS.put("Default", new BigDecimal("1.0")); // Default for unknown categories
    }
    
    // Delivery emission factor: kg CO2 per km
    private static final BigDecimal DELIVERY_EMISSION_FACTOR = new BigDecimal("0.2"); // Average delivery vehicle
    
    // Packaging emission factors (kg CO2 per order)
    private static final Map<String, BigDecimal> PACKAGING_EMISSION_FACTORS = new HashMap<>();
    
    static {
        PACKAGING_EMISSION_FACTORS.put("STANDARD", new BigDecimal("0.5"));
        PACKAGING_EMISSION_FACTORS.put("ECO_FRIENDLY", new BigDecimal("0.2"));
        PACKAGING_EMISSION_FACTORS.put("MINIMAL", new BigDecimal("0.1"));
    }
    
    // Average weight per item (kg) - used when weight is not available
    private static final BigDecimal DEFAULT_ITEM_WEIGHT = new BigDecimal("0.5");
    
    /**
     * Calculate carbon footprint for an order
     */
    public CarbonFootprintDto calculateCarbonFootprint(Order order) {
        BigDecimal productFootprint = BigDecimal.ZERO;
        BigDecimal deliveryFootprint = BigDecimal.ZERO;
        BigDecimal packagingFootprint = BigDecimal.ZERO;
        
        Map<String, CategoryFootprintData> categoryFootprints = new HashMap<>();
        
        // Calculate product footprint
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                // Get category from product (we'll need to fetch this from catalog service)
                // For now, we'll use a default approach
                String category = getCategoryFromProductName(item.getProductName());
                BigDecimal emissionFactor = CATEGORY_EMISSION_FACTORS.getOrDefault(
                    category, 
                    CATEGORY_EMISSION_FACTORS.get("Default")
                );
                
                // Calculate weight: use weight if available, otherwise estimate from quantity
                BigDecimal weight = item.getWeight() != null 
                    ? item.getWeight() 
                    : DEFAULT_ITEM_WEIGHT.multiply(new BigDecimal(item.getQuantity()));
                
                BigDecimal itemFootprint = emissionFactor.multiply(weight);
                productFootprint = productFootprint.add(itemFootprint);
                
                // Track by category
                categoryFootprints.computeIfAbsent(category, k -> new CategoryFootprintData())
                    .addFootprint(itemFootprint, item.getQuantity());
            }
        }
        
        // Calculate delivery footprint
        BigDecimal deliveryDistance = order.getDeliveryDistanceKm() != null 
            ? order.getDeliveryDistanceKm() 
            : new BigDecimal("5.0"); // Default 5km
        
        deliveryFootprint = deliveryDistance.multiply(DELIVERY_EMISSION_FACTOR);
        
        // Calculate packaging footprint
        String packagingType = order.getPackagingType() != null 
            ? order.getPackagingType() 
            : "STANDARD";
        
        packagingFootprint = PACKAGING_EMISSION_FACTORS.getOrDefault(
            packagingType, 
            PACKAGING_EMISSION_FACTORS.get("STANDARD")
        );
        
        BigDecimal totalFootprint = productFootprint
            .add(deliveryFootprint)
            .add(packagingFootprint)
            .setScale(4, RoundingMode.HALF_UP);
        
        // Build category footprints list
        List<CarbonFootprintDto.CategoryFootprint> categoryFootprintList = categoryFootprints.entrySet().stream()
            .map(entry -> CarbonFootprintDto.CategoryFootprint.builder()
                .categoryName(entry.getKey())
                .carbonFootprintKg(entry.getValue().totalFootprint.setScale(4, RoundingMode.HALF_UP))
                .itemCount(entry.getValue().itemCount)
                .build())
            .collect(Collectors.toList());
        
        return CarbonFootprintDto.builder()
            .carbonFootprintKg(totalFootprint)
            .deliveryDistanceKm(deliveryDistance)
            .packagingType(packagingType)
            .breakdown(CarbonFootprintDto.CarbonBreakdown.builder()
                .productFootprintKg(productFootprint.setScale(4, RoundingMode.HALF_UP))
                .deliveryFootprintKg(deliveryFootprint.setScale(4, RoundingMode.HALF_UP))
                .packagingFootprintKg(packagingFootprint.setScale(4, RoundingMode.HALF_UP))
                .build())
            .categoryFootprints(categoryFootprintList)
            .build();
    }
    
    /**
     * Get category from product name (simple heuristic)
     * In a real system, you'd fetch this from the catalog service
     */
    private String getCategoryFromProductName(String productName) {
        String name = productName.toLowerCase();
        
        if (name.contains("meat") || name.contains("chicken") || name.contains("beef") || 
            name.contains("pork") || name.contains("lamb") || name.contains("fish")) {
            return "Meat";
        }
        if (name.contains("milk") || name.contains("cheese") || name.contains("yogurt") || 
            name.contains("butter") || name.contains("cream")) {
            return "Dairy";
        }
        if (name.contains("apple") || name.contains("banana") || name.contains("orange") || 
            name.contains("grape") || name.contains("berry") || name.contains("fruit")) {
            return "Fruits";
        }
        if (name.contains("vegetable") || name.contains("carrot") || name.contains("potato") || 
            name.contains("tomato") || name.contains("onion") || name.contains("pepper")) {
            return "Vegetables";
        }
        if (name.contains("rice") || name.contains("wheat") || name.contains("bread") || 
            name.contains("flour") || name.contains("pasta")) {
            return "Grains";
        }
        if (name.contains("drink") || name.contains("juice") || name.contains("soda") || 
            name.contains("water") || name.contains("tea") || name.contains("coffee")) {
            return "Beverages";
        }
        if (name.contains("frozen")) {
            return "Frozen";
        }
        if (name.contains("can") || name.contains("canned")) {
            return "Canned";
        }
        
        return "Default";
    }
    
    /**
     * Save carbon footprint for an order
     */
    @Transactional
    public void saveCarbonFootprint(Order order, CarbonFootprintDto footprint) {
        // Update order with carbon footprint
        order.setCarbonFootprintKg(footprint.getCarbonFootprintKg());
        order.setDeliveryDistanceKm(footprint.getDeliveryDistanceKm());
        order.setPackagingType(footprint.getPackagingType());
        orderRepository.save(order);
        
        // Save to history
        CarbonFootprintHistory history = CarbonFootprintHistory.builder()
            .userId(order.getUserId())
            .orderId(order.getId())
            .carbonFootprintKg(footprint.getCarbonFootprintKg())
            .orderDate(order.getCreatedAt().toLocalDate())
            .build();
        
        carbonFootprintHistoryRepository.save(history);
    }
    
    /**
     * Get user's carbon footprint summary
     */
    public UserCarbonSummaryDto getUserCarbonSummary(Long userId) {
        List<CarbonFootprintHistory> history = carbonFootprintHistoryRepository.findByUserIdOrderByOrderDateDesc(userId);
        
        if (history.isEmpty()) {
            return UserCarbonSummaryDto.builder()
                .userId(userId)
                .totalOrders(0)
                .totalCarbonKg(BigDecimal.ZERO)
                .averageCarbonPerOrderKg(BigDecimal.ZERO)
                .build();
        }
        
        BigDecimal totalCarbon = history.stream()
            .map(CarbonFootprintHistory::getCarbonFootprintKg)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal avgCarbon = totalCarbon.divide(
            new BigDecimal(history.size()), 
            4, 
            RoundingMode.HALF_UP
        );
        
        BigDecimal minCarbon = history.stream()
            .map(CarbonFootprintHistory::getCarbonFootprintKg)
            .min(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);
        
        BigDecimal maxCarbon = history.stream()
            .map(CarbonFootprintHistory::getCarbonFootprintKg)
            .max(BigDecimal::compareTo)
            .orElse(BigDecimal.ZERO);
        
        LocalDate firstOrderDate = history.stream()
            .map(CarbonFootprintHistory::getOrderDate)
            .min(LocalDate::compareTo)
            .orElse(LocalDate.now());
        
        LocalDate lastOrderDate = history.stream()
            .map(CarbonFootprintHistory::getOrderDate)
            .max(LocalDate::compareTo)
            .orElse(LocalDate.now());
        
        // Calculate monthly footprints
        Map<String, MonthlyData> monthlyData = new HashMap<>();
        for (CarbonFootprintHistory h : history) {
            String month = h.getOrderDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            monthlyData.computeIfAbsent(month, k -> new MonthlyData())
                .addFootprint(h.getCarbonFootprintKg());
        }
        
        List<UserCarbonSummaryDto.MonthlyFootprint> monthlyFootprints = monthlyData.entrySet().stream()
            .sorted(Map.Entry.<String, MonthlyData>comparingByKey().reversed())
            .limit(12) // Last 12 months
            .map(entry -> UserCarbonSummaryDto.MonthlyFootprint.builder()
                .month(entry.getKey())
                .carbonKg(entry.getValue().total.setScale(4, RoundingMode.HALF_UP))
                .orderCount(entry.getValue().count)
                .build())
            .collect(Collectors.toList());
        
        // Calculate average user footprint (simplified - in real system, calculate from all users)
        BigDecimal averageUserFootprint = new BigDecimal("15.0"); // kg per order (example)
        BigDecimal carbonSaved = averageUserFootprint.multiply(new BigDecimal(history.size()))
            .subtract(totalCarbon);
        
        // Determine eco badge
        String ecoBadge = determineEcoBadge(avgCarbon, carbonSaved);
        
        return UserCarbonSummaryDto.builder()
            .userId(userId)
            .totalOrders(history.size())
            .totalCarbonKg(totalCarbon.setScale(4, RoundingMode.HALF_UP))
            .averageCarbonPerOrderKg(avgCarbon)
            .minCarbonKg(minCarbon)
            .maxCarbonKg(maxCarbon)
            .firstOrderDate(firstOrderDate)
            .lastOrderDate(lastOrderDate)
            .carbonSavedKg(carbonSaved.setScale(4, RoundingMode.HALF_UP))
            .ecoBadge(ecoBadge)
            .monthlyFootprints(monthlyFootprints)
            .build();
    }
    
    private String determineEcoBadge(BigDecimal avgCarbon, BigDecimal carbonSaved) {
        if (avgCarbon.compareTo(new BigDecimal("5.0")) < 0 && carbonSaved.compareTo(new BigDecimal("50.0")) > 0) {
            return "🌱 Eco Warrior";
        } else if (avgCarbon.compareTo(new BigDecimal("10.0")) < 0 && carbonSaved.compareTo(new BigDecimal("20.0")) > 0) {
            return "🌿 Green Shopper";
        } else if (avgCarbon.compareTo(new BigDecimal("15.0")) < 0) {
            return "🌍 Climate Conscious";
        } else {
            return "🛒 Regular Shopper";
        }
    }
    
    // Helper classes
    private static class CategoryFootprintData {
        BigDecimal totalFootprint = BigDecimal.ZERO;
        int itemCount = 0;
        
        void addFootprint(BigDecimal footprint, int quantity) {
            totalFootprint = totalFootprint.add(footprint);
            itemCount += quantity;
        }
    }
    
    private static class MonthlyData {
        BigDecimal total = BigDecimal.ZERO;
        int count = 0;
        
        void addFootprint(BigDecimal footprint) {
            total = total.add(footprint);
            count++;
        }
    }
}

