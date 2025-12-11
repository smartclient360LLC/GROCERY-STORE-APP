package com.grocerystore.order.controller;

import com.grocerystore.order.dto.CarbonFootprintDto;
import com.grocerystore.order.dto.CreateOrderRequest;
import com.grocerystore.order.dto.CreateScheduledOrderRequest;
import com.grocerystore.order.dto.FrequentlyOrderedProductDto;
import com.grocerystore.order.dto.OrderDto;
import com.grocerystore.order.dto.OrderItemDto;
import com.grocerystore.order.dto.SalesReportDto;
import com.grocerystore.order.dto.ScheduledOrderDto;
import com.grocerystore.order.dto.UserCarbonSummaryDto;
import com.grocerystore.order.model.Order;
import com.grocerystore.order.model.ScheduledOrder;
import com.grocerystore.order.service.CarbonFootprintService;
import com.grocerystore.order.service.OrderService;
import com.grocerystore.order.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
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
    private final CarbonFootprintService carbonFootprintService;
    private final JwtUtil jwtUtil;
    
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
    @PreAuthorize("hasRole('ADMIN')")
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
    
    // ========== Scheduled Orders (Bulk Order Planner) Endpoints ==========
    
    @PostMapping("/scheduled")
    public ResponseEntity<?> createScheduledOrder(
            @RequestParam Long userId,
            @Valid @RequestBody CreateScheduledOrderRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Extract userId from token to verify authorization
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    Long tokenUserId = jwtUtil.extractUserId(token);
                    if (tokenUserId != null && !tokenUserId.equals(userId)) {
                        java.util.Map<String, String> error = new java.util.HashMap<>();
                        error.put("message", "You can only create scheduled orders for your own account");
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                    }
                } catch (Exception e) {
                    // If we can't extract userId from token, continue anyway
                    // The JWT filter should have already validated the token
                }
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(orderService.createScheduledOrder(userId, request));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/scheduled/user/{userId}")
    public ResponseEntity<List<ScheduledOrderDto>> getUserScheduledOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getUserScheduledOrders(userId));
    }
    
    @GetMapping("/scheduled/user/{userId}/status/{status}")
    public ResponseEntity<List<ScheduledOrderDto>> getUserScheduledOrdersByStatus(
            @PathVariable Long userId,
            @PathVariable ScheduledOrder.ScheduledOrderStatus status) {
        return ResponseEntity.ok(orderService.getUserScheduledOrdersByStatus(userId, status));
    }
    
    @GetMapping("/scheduled/user/{userId}/date-range")
    public ResponseEntity<List<ScheduledOrderDto>> getUserScheduledOrdersByDateRange(
            @PathVariable Long userId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(orderService.getUserScheduledOrdersByDateRange(userId, startDate, endDate));
    }
    
    @GetMapping("/scheduled/{id}")
    public ResponseEntity<?> getScheduledOrderById(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(orderService.getScheduledOrderById(id, userId));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Scheduled order not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/scheduled/{id}")
    public ResponseEntity<?> updateScheduledOrder(
            @PathVariable Long id,
            @RequestParam Long userId,
            @Valid @RequestBody CreateScheduledOrderRequest request) {
        try {
            return ResponseEntity.ok(orderService.updateScheduledOrder(id, userId, request));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/scheduled/{id}/cancel")
    public ResponseEntity<?> cancelScheduledOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            orderService.cancelScheduledOrder(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to cancel scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/scheduled/{id}/pause")
    public ResponseEntity<?> pauseScheduledOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            orderService.pauseScheduledOrder(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to pause scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/scheduled/{id}/resume")
    public ResponseEntity<?> resumeScheduledOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            orderService.resumeScheduledOrder(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to resume scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/scheduled/{id}")
    public ResponseEntity<?> deleteScheduledOrder(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            orderService.deleteScheduledOrder(id, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete scheduled order");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== Carbon Footprint Endpoints ==========
    
    @GetMapping("/{orderId}/carbon-footprint")
    public ResponseEntity<CarbonFootprintDto> getOrderCarbonFootprint(@PathVariable Long orderId) {
        try {
            Order orderEntity = orderService.getOrderEntityById(orderId);
            CarbonFootprintDto footprint = carbonFootprintService.calculateCarbonFootprint(orderEntity);
            return ResponseEntity.ok(footprint);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/user/{userId}/carbon-summary")
    public ResponseEntity<UserCarbonSummaryDto> getUserCarbonSummary(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(carbonFootprintService.getUserCarbonSummary(userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

