package com.grocerystore.cart.service;

import com.grocerystore.cart.dto.CartDto;
import com.grocerystore.cart.dto.CartItemDto;
import com.grocerystore.cart.model.CartItem;
import com.grocerystore.cart.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartItemRepository cartItemRepository;
    
    public CartDto getCart(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserId(userId);
        List<CartItemDto> itemDtos = items.stream()
                .map(this::toCartItemDto)
                .collect(Collectors.toList());
        
        BigDecimal total = itemDtos.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return CartDto.builder()
                .userId(userId)
                .items(itemDtos)
                .total(total)
                .itemCount(items.size())
                .build();
    }
    
    @Transactional
    public CartItemDto addItem(Long userId, Long productId, String productName, BigDecimal price, Integer quantity, BigDecimal weight) {
        CartItem existingItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElse(null);
        
        if (existingItem != null) {
            if (weight != null) {
                // For weight-based items, add to existing weight
                BigDecimal newWeight = existingItem.getWeight() != null 
                    ? existingItem.getWeight().add(weight) 
                    : weight;
                existingItem.setWeight(newWeight);
                existingItem.setQuantity(1); // Keep quantity as 1 for weight-based items
            } else {
                existingItem.setQuantity(existingItem.getQuantity() + quantity);
            }
            existingItem = cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .userId(userId)
                    .productId(productId)
                    .productName(productName)
                    .price(price)
                    .quantity(weight != null ? 1 : quantity)
                    .weight(weight)
                    .build();
            existingItem = cartItemRepository.save(newItem);
        }
        
        return toCartItemDto(existingItem);
    }
    
    @Transactional
    public CartItemDto updateItemQuantity(Long userId, Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        
        item.setQuantity(quantity);
        item = cartItemRepository.save(item);
        return toCartItemDto(item);
    }
    
    @Transactional
    public CartItemDto updateItemWeight(Long userId, Long itemId, BigDecimal weight) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        if (weight == null || weight.compareTo(BigDecimal.ZERO) <= 0) {
            cartItemRepository.delete(item);
            return null;
        }
        
        item.setWeight(weight);
        item.setQuantity(1); // Keep quantity as 1 for weight-based items
        item = cartItemRepository.save(item);
        return toCartItemDto(item);
    }
    
    @Transactional
    public void removeItem(Long userId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        cartItemRepository.delete(item);
    }
    
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
    
    private CartItemDto toCartItemDto(CartItem item) {
        // Calculate subtotal: use weight if available (for weight-based items), otherwise use quantity
        BigDecimal subtotal;
        if (item.getWeight() != null && item.getWeight().compareTo(BigDecimal.ZERO) > 0) {
            subtotal = item.getPrice().multiply(item.getWeight());
        } else {
            subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        }
        
        return CartItemDto.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .weight(item.getWeight())
                .subtotal(subtotal)
                .build();
    }
}

