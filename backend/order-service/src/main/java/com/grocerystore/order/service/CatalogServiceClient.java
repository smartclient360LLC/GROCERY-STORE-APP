package com.grocerystore.order.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${catalog.service.url}")
    private String catalogServiceUrl;
    
    /**
     * Update product stock quantity (decrement by quantity ordered)
     * @param productId Product ID
     * @param quantity Quantity to decrement (positive number)
     */
    public void updateStock(Long productId, Integer quantity) {
        try {
            String url = String.format("%s/api/catalog/products/%d/stock?quantity=%d", 
                    catalogServiceUrl, productId, quantity);
            
            log.info("Calling catalog service to update stock: URL={}, Product ID={}, Quantity={}", 
                    url, productId, quantity);
            
            restTemplate.put(url, null);
            
            log.info("Successfully updated stock for product {}: decremented by {}", productId, quantity);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("HTTP error updating stock for product {}: Status={}, Response={}", 
                    productId, e.getStatusCode(), e.getResponseBodyAsString(), e);
            // Don't throw exception - stock update failure shouldn't fail the order
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Connection error updating stock for product {}: Catalog service may be unavailable. Error: {}", 
                    productId, e.getMessage(), e);
            // Don't throw exception - stock update failure shouldn't fail the order
        } catch (Exception e) {
            log.error("Unexpected error updating stock for product {}: {}", productId, e.getMessage(), e);
            // Don't throw exception - stock update failure shouldn't fail the order
        }
    }
}

