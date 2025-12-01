package com.grocerystore.order.controller;

import com.grocerystore.order.dto.CreateOrderRequest;
import com.grocerystore.order.dto.FrequentlyOrderedProductDto;
import com.grocerystore.order.dto.OrderDto;
import com.grocerystore.order.dto.OrderItemDto;
import com.grocerystore.order.dto.SalesReportDto;
import com.grocerystore.order.model.Order;
import com.grocerystore.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(orderService.createOrder(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(orderService.getOrderById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getOrderByOrderNumber(@PathVariable String orderNumber) {
        try {
            return ResponseEntity.ok(orderService.getOrderByOrderNumber(orderNumber));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDto>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        try {
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/pos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDto> createPosOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            request.setIsPosOrder(true);
            if (request.getShippingAddress() == null) {
                // For POS orders, shipping address is optional
                request.setShippingAddress(null);
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(orderService.createOrder(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/sales/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesReportDto> getDailySales(
            @RequestParam(required = false) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        return ResponseEntity.ok(orderService.getDailySales(date));
    }
    
    @GetMapping("/sales/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SalesReportDto>> getMonthlySales(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(orderService.getMonthlySales(year, month));
    }
    
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDto>> getAllOrders(
            @RequestParam(required = false) Boolean isPosOrder) {
        return ResponseEntity.ok(orderService.getAllOrders(isPosOrder));
    }
    
    /**
     * Get frequently ordered products for a user (for "Buy Again" feature)
     */
    @GetMapping("/user/{userId}/frequently-ordered")
    public ResponseEntity<List<FrequentlyOrderedProductDto>> getFrequentlyOrderedProducts(
            @PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getFrequentlyOrderedProducts(userId));
    }
    
    /**
     * Get order items for reordering
     */
    @GetMapping("/{orderId}/reorder-items")
    public ResponseEntity<List<OrderItemDto>> getOrderItemsForReorder(
            @PathVariable Long orderId,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(orderService.getOrderItemsForReorder(orderId, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

