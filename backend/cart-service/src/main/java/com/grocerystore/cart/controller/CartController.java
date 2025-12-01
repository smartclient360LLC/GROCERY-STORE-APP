package com.grocerystore.cart.controller;

import com.grocerystore.cart.dto.CartDto;
import com.grocerystore.cart.dto.CartItemDto;
import com.grocerystore.cart.dto.UpdateCartItemRequest;
import com.grocerystore.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<CartDto> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }
    
    @PostMapping("/{userId}/items")
    public ResponseEntity<CartItemDto> addItem(
            @PathVariable Long userId,
            @RequestParam Long productId,
            @RequestParam String productName,
            @RequestParam BigDecimal price,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String weight) {
        try {
            BigDecimal weightValue = null;
            if (weight != null && !weight.trim().isEmpty()) {
                try {
                    weightValue = new BigDecimal(weight.trim());
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().build();
                }
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(cartService.addItem(userId, productId, productName, price, quantity, weightValue));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping(value = "/{userId}/items/{itemId}", consumes = {"*/*"})
    public ResponseEntity<?> updateItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long itemId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String weight) {
        try {
            CartItemDto item;
            if (weight != null && !weight.trim().isEmpty()) {
                // Update weight for weight-based items
                try {
                    BigDecimal weightDecimal = new BigDecimal(weight.trim());
                    // Validate weight is positive
                    if (weightDecimal.compareTo(BigDecimal.ZERO) <= 0) {
                        java.util.Map<String, String> error = new java.util.HashMap<>();
                        error.put("message", "Weight must be greater than 0");
                        return ResponseEntity.badRequest().body(error);
                    }
                    item = cartService.updateItemWeight(userId, itemId, weightDecimal);
                } catch (NumberFormatException e) {
                    java.util.Map<String, String> error = new java.util.HashMap<>();
                    error.put("message", "Invalid weight format: " + weight);
                    return ResponseEntity.badRequest().body(error);
                }
            } else if (quantity != null) {
                // Update quantity for quantity-based items
                item = cartService.updateItemQuantity(userId, itemId, quantity);
            } else {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Either quantity or weight must be provided");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (item == null) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            // Log the exception for debugging
            e.printStackTrace();
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update cart item");
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @DeleteMapping("/{userId}/items/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long userId, @PathVariable Long itemId) {
        try {
            cartService.removeItem(userId, itemId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}

