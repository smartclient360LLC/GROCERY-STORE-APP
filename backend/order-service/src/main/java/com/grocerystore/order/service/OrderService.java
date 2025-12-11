package com.grocerystore.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocerystore.order.dto.*;
import com.grocerystore.order.model.*;
import com.grocerystore.order.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ScheduledOrderRepository scheduledOrderRepository;
    private final ScheduledOrderItemRepository scheduledOrderItemRepository;
    private final OrderExecutionHistoryRepository executionHistoryRepository;
    private final RabbitTemplate rabbitTemplate;
    private final EntityManager entityManager;
    private final CarbonFootprintService carbonFootprintService;
    private final CatalogServiceClient catalogServiceClient;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private static final String EXCHANGE = "order-exchange";
    private static final String ROUTING_KEY = "order.created";
    
    // Utah state grocery tax rate: 6.1%
    private static final BigDecimal TAX_RATE = new BigDecimal("0.061");
    
    // Delivery fee for orders below $100
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("10.00");
    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("100.00");
    
    @Transactional
    public OrderDto createOrder(CreateOrderRequest request) {
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // Calculate subtotal (before tax)
        BigDecimal subtotal = request.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate tax (6.1% of subtotal)
        BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(2, java.math.RoundingMode.HALF_UP);
        
        // Calculate amount after tax (subtotal + tax)
        BigDecimal amountAfterTax = subtotal.add(taxAmount);
        
        // Calculate delivery fee: $10 if order total (subtotal + tax) is below $100
        // For POS orders, no delivery fee
        BigDecimal deliveryFee = BigDecimal.ZERO;
        if (request.getIsPosOrder() == null || !request.getIsPosOrder()) {
            if (amountAfterTax.compareTo(FREE_DELIVERY_THRESHOLD) < 0) {
                deliveryFee = DELIVERY_FEE;
            }
        }
        
        // Calculate total (subtotal + tax + delivery fee)
        BigDecimal totalAmount = amountAfterTax.add(deliveryFee);
        
        final Order order = Order.builder()
                .orderNumber(orderNumber)
                .userId(request.getUserId())
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .deliveryFee(deliveryFee)
                .totalAmount(totalAmount)
                .status(request.getIsPosOrder() ? Order.OrderStatus.CONFIRMED : Order.OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .isPosOrder(request.getIsPosOrder() != null ? request.getIsPosOrder() : false)
                .shippingAddress(request.getShippingAddress())
                .build();
        
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemDto -> {
                    // Calculate subtotal: use weight if available, otherwise use quantity
                    BigDecimal itemSubtotal;
                    if (itemDto.getWeight() != null && itemDto.getWeight().compareTo(BigDecimal.ZERO) > 0) {
                        itemSubtotal = itemDto.getPrice().multiply(itemDto.getWeight());
                    } else {
                        itemSubtotal = itemDto.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
                    }
                    
                    return OrderItem.builder()
                            .order(order)
                            .productId(itemDto.getProductId())
                            .productName(itemDto.getProductName())
                            .price(itemDto.getPrice())
                            .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : 1)
                            .weight(itemDto.getWeight())
                            .subtotal(itemSubtotal)
                            .build();
                })
                .collect(Collectors.toList());
        
        order.setItems(orderItems);
        Order savedOrder = orderRepository.save(order);
        
        // Calculate and save carbon footprint
        try {
            CarbonFootprintDto footprint = carbonFootprintService.calculateCarbonFootprint(savedOrder);
            carbonFootprintService.saveCarbonFootprint(savedOrder, footprint);
            // Reload order to get updated carbon footprint
            savedOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);
        } catch (Exception e) {
            log.warn("Failed to calculate carbon footprint for order {}: {}", savedOrder.getId(), e.getMessage());
        }
        
        // Update stock if order is confirmed (POS orders are confirmed immediately)
        if (savedOrder.getStatus() == Order.OrderStatus.CONFIRMED) {
            updateStockForOrder(savedOrder);
        }
        
        // Publish order created event
        publishOrderCreatedEvent(savedOrder);
        
        return toOrderDto(savedOrder);
    }
    
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderDto(order);
    }
    
    public Order getOrderEntityById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public OrderDto getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderDto(order);
    }
    
    public List<OrderDto> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }
    
    public List<OrderDto> getAllOrders(Boolean isPosOrder) {
        List<Order> orders;
        if (isPosOrder != null) {
            orders = orderRepository.findByIsPosOrderOrderByCreatedAtDesc(isPosOrder);
        } else {
            orders = orderRepository.findAllByOrderByCreatedAtDesc();
        }
        return orders.stream()
                .map(this::toOrderDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OrderDto updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Order.OrderStatus previousStatus = order.getStatus();
        
        // Force load items (lazy loading) - must be done before status change
        if (order.getItems() != null) {
            order.getItems().size(); // Trigger lazy loading
            log.debug("Loaded {} items for order {}", order.getItems().size(), order.getOrderNumber());
        } else {
            log.warn("Order {} has null items collection", order.getOrderNumber());
        }
        
        order.setStatus(status);
        order = orderRepository.save(order);
        
        // Update stock when order status changes to CONFIRMED
        if (previousStatus != Order.OrderStatus.CONFIRMED && status == Order.OrderStatus.CONFIRMED) {
            log.info("Order {} status changed from {} to CONFIRMED, updating stock", 
                    order.getOrderNumber(), previousStatus);
            updateStockForOrder(order);
        } else {
            log.debug("Order {} status change from {} to {} - no stock update needed", 
                    order.getOrderNumber(), previousStatus, status);
        }
        
        return toOrderDto(order);
    }
    
    @Transactional
    public OrderDto updateOrderStatusByOrderNumber(String orderNumber, Order.OrderStatus status) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Order.OrderStatus previousStatus = order.getStatus();
        
        // Force load items (lazy loading) - must be done before status change
        if (order.getItems() != null) {
            order.getItems().size(); // Trigger lazy loading
            log.debug("Loaded {} items for order {}", order.getItems().size(), order.getOrderNumber());
        } else {
            log.warn("Order {} has null items collection", order.getOrderNumber());
        }
        
        order.setStatus(status);
        order = orderRepository.save(order);
        
        // Update stock when order status changes to CONFIRMED
        if (previousStatus != Order.OrderStatus.CONFIRMED && status == Order.OrderStatus.CONFIRMED) {
            log.info("Order {} status changed from {} to CONFIRMED, updating stock", 
                    order.getOrderNumber(), previousStatus);
            updateStockForOrder(order);
        } else {
            log.debug("Order {} status change from {} to {} - no stock update needed", 
                    order.getOrderNumber(), previousStatus, status);
        }
        
        return toOrderDto(order);
    }
    
    /**
     * Update stock for all items in an order
     * This is called when an order is confirmed (either POS orders or online orders after payment)
     */
    private void updateStockForOrder(Order order) {
        log.info("=== Starting stock update for order {} with {} items ===", 
                order.getOrderNumber(), order.getItems() != null ? order.getItems().size() : 0);
        
        if (order.getItems() == null || order.getItems().isEmpty()) {
            log.warn("Order {} has no items, skipping stock update", order.getOrderNumber());
            return;
        }
        
        for (OrderItem item : order.getItems()) {
            try {
                // Calculate quantity to decrement
                // For weight-based items, use quantity=1 (weight is already accounted for in the order)
                // For quantity-based items, use the quantity
                Integer quantityToDecrement = item.getQuantity() != null ? item.getQuantity() : 1;
                
                log.info("Updating stock: Product ID={}, Product Name={}, Quantity to decrement={}", 
                        item.getProductId(), item.getProductName(), quantityToDecrement);
                
                catalogServiceClient.updateStock(item.getProductId(), quantityToDecrement);
                
                log.info("Successfully updated stock for product {} ({}): decremented by {}", 
                        item.getProductId(), item.getProductName(), quantityToDecrement);
            } catch (Exception e) {
                log.error("Failed to update stock for product {} ({}) in order {}: {}", 
                        item.getProductId(), item.getProductName(), order.getOrderNumber(), 
                        e.getMessage(), e);
                // Continue with other items even if one fails
            }
        }
        
        log.info("=== Completed stock update for order {} ===", order.getOrderNumber());
    }
    
    private void publishOrderCreatedEvent(Order order) {
        try {
            // Publish event to RabbitMQ for inventory updates
            rabbitTemplate.convertAndSend(EXCHANGE, ROUTING_KEY, order.getId());
        } catch (Exception e) {
            // Log error but don't fail the order creation if RabbitMQ is unavailable
            log.error("Failed to publish order created event to RabbitMQ", e);
        }
    }
    
    private OrderDto toOrderDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .weight(item.getWeight())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
        
        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .items(itemDtos)
                .subtotal(order.getSubtotal() != null ? order.getSubtotal() : order.getTotalAmount())
                .taxAmount(order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO)
                .deliveryFee(order.getDeliveryFee() != null ? order.getDeliveryFee() : BigDecimal.ZERO)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .isPosOrder(order.getIsPosOrder())
                .shippingAddress(order.getShippingAddress())
                .carbonFootprintKg(order.getCarbonFootprintKg())
                .deliveryDistanceKm(order.getDeliveryDistanceKm())
                .packagingType(order.getPackagingType())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    public SalesReportDto getDailySales(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        List<Order> orders = orderRepository.findByCreatedAtBetweenAndStatusIn(
                startOfDay, endOfDay, 
                List.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.DELIVERED)
        );
        
        return buildSalesReport(orders, date);
    }
    
    public List<SalesReportDto> getMonthlySales(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atStartOfDay();
        
        List<Order> allOrders = orderRepository.findByCreatedAtBetweenAndStatusIn(
                start, end,
                List.of(Order.OrderStatus.CONFIRMED, Order.OrderStatus.DELIVERED)
        );
        
        return allOrders.stream()
                .collect(Collectors.groupingBy(order -> order.getCreatedAt().toLocalDate()))
                .entrySet().stream()
                .map(entry -> buildSalesReport(entry.getValue(), entry.getKey()))
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }
    
    private SalesReportDto buildSalesReport(List<Order> orders, LocalDate date) {
        long totalOrders = orders.size();
        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Separate online and POS sales
        BigDecimal onlineSales = orders.stream()
                .filter(o -> o.getIsPosOrder() != null && !o.getIsPosOrder())
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal posSales = orders.stream()
                .filter(o -> o.getIsPosOrder() != null && o.getIsPosOrder())
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // POS payment methods breakdown
        BigDecimal cashSales = orders.stream()
                .filter(o -> o.getIsPosOrder() != null && o.getIsPosOrder() 
                        && o.getPaymentMethod() == Order.PaymentMethod.CASH)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal cardSales = orders.stream()
                .filter(o -> o.getIsPosOrder() != null && o.getIsPosOrder()
                        && (o.getPaymentMethod() == Order.PaymentMethod.CREDIT_CARD 
                        || o.getPaymentMethod() == Order.PaymentMethod.DEBIT_CARD))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal qrSales = orders.stream()
                .filter(o -> o.getIsPosOrder() != null && o.getIsPosOrder()
                        && o.getPaymentMethod() == Order.PaymentMethod.QR_CODE)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return SalesReportDto.builder()
                .date(date)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .cashSales(cashSales)
                .cardSales(cardSales)
                .qrSales(qrSales)
                .onlineSales(onlineSales)
                .build();
    }
    
    /**
     * Get frequently ordered products for a user (for "Buy Again" feature)
     * Returns products ordered at least 2 times, sorted by frequency
     */
    public List<FrequentlyOrderedProductDto> getFrequentlyOrderedProducts(Long userId) {
        // Get all orders for the user (only online orders, exclude POS)
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(order -> order.getIsPosOrder() == null || !order.getIsPosOrder())
                .collect(Collectors.toList());
        
        if (userOrders.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Group order items by productId
        Map<Long, List<OrderItem>> productItemsMap = userOrders.stream()
                .flatMap(order -> order.getItems().stream())
                .collect(Collectors.groupingBy(OrderItem::getProductId));
        
        // Calculate statistics for each product
        List<FrequentlyOrderedProductDto> frequentlyOrdered = productItemsMap.entrySet().stream()
                .filter(entry -> entry.getValue().size() >= 2) // At least ordered 2 times
                .map(entry -> {
                    List<OrderItem> items = entry.getValue();
                    OrderItem firstItem = items.get(0);
                    
                    // Calculate averages
                    BigDecimal totalPrice = items.stream()
                            .map(OrderItem::getPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal averagePrice = totalPrice.divide(
                            BigDecimal.valueOf(items.size()), 2, RoundingMode.HALF_UP);
                    
                    int totalQuantity = items.stream()
                            .mapToInt(OrderItem::getQuantity)
                            .sum();
                    int averageQuantity = totalQuantity / items.size();
                    
                    // Calculate average weight (if any items have weight)
                    BigDecimal totalWeight = items.stream()
                            .filter(item -> item.getWeight() != null)
                            .map(OrderItem::getWeight)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal averageWeight = null;
                    if (totalWeight.compareTo(BigDecimal.ZERO) > 0) {
                        long weightItemsCount = items.stream()
                                .filter(item -> item.getWeight() != null)
                                .count();
                        if (weightItemsCount > 0) {
                            averageWeight = totalWeight.divide(
                                    BigDecimal.valueOf(weightItemsCount), 2, RoundingMode.HALF_UP);
                        }
                    }
                    
                    // Get last ordered date
                    String lastOrderedDate = items.stream()
                            .map(item -> item.getOrder().getCreatedAt())
                            .max(LocalDateTime::compareTo)
                            .map(date -> date.format(DateTimeFormatter.ISO_LOCAL_DATE))
                            .orElse("");
                    
                    return FrequentlyOrderedProductDto.builder()
                            .productId(firstItem.getProductId())
                            .productName(firstItem.getProductName())
                            .averagePrice(averagePrice)
                            .totalTimesOrdered(items.size())
                            .averageQuantity(averageQuantity)
                            .averageWeight(averageWeight)
                            .lastOrderedDate(lastOrderedDate)
                            .build();
                })
                .sorted((a, b) -> b.getTotalTimesOrdered().compareTo(a.getTotalTimesOrdered())) // Sort by frequency
                .limit(10) // Top 10 most frequently ordered
                .collect(Collectors.toList());
        
        return frequentlyOrdered;
    }
    
    /**
     * Get order items for reordering (returns items that can be added to cart)
     */
    public List<OrderItemDto> getOrderItemsForReorder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        // Verify the order belongs to the user
        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("Order does not belong to user");
        }
        
        return order.getItems().stream()
                .map(item -> OrderItemDto.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .weight(item.getWeight())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());
    }
    
    // ========== Scheduled Orders (Bulk Order Planner) ==========
    
    @Transactional
    public ScheduledOrderDto createScheduledOrder(Long userId, CreateScheduledOrderRequest request) {
        // Validate recurring order requirements
        if (request.getOrderType() == ScheduledOrder.OrderType.RECURRING) {
            if (request.getRecurrenceType() == null) {
                throw new RuntimeException("Recurrence type is required for recurring orders");
            }
        }
        
        // Set delivery date to scheduled date if not provided
        LocalDate deliveryDate = request.getDeliveryDate() != null 
            ? request.getDeliveryDate() 
            : request.getScheduledDate();
        
        // Calculate next execution date
        LocalDate nextExecutionDate = request.getScheduledDate();
        if (request.getOrderType() == ScheduledOrder.OrderType.RECURRING) {
            nextExecutionDate = calculateNextExecutionDate(
                request.getScheduledDate(), 
                request.getRecurrenceType()
            );
        }
        
        // Convert cart items to JSON
        String cartSnapshotJson = convertCartItemsToJson(request.getItems());
        String shippingAddressJson = convertShippingAddressToJson(request.getShippingAddress());
        
        // Use native query to properly handle JSONB casting with CAST syntax
        String insertSql = "INSERT INTO scheduled_orders " +
                "(user_id, order_name, order_type, recurrence_type, scheduled_date, scheduled_time, " +
                "delivery_date, delivery_time, status, next_execution_date, end_date, max_occurrences, " +
                "current_occurrence, cart_snapshot, shipping_address, delivery_point, notes, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSONB), CAST(? AS JSONB), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
                "RETURNING id";
        
        Long scheduledOrderId = (Long) entityManager.createNativeQuery(insertSql)
                .setParameter(1, userId)
                .setParameter(2, request.getOrderName())
                .setParameter(3, request.getOrderType().name())
                .setParameter(4, request.getRecurrenceType() != null ? request.getRecurrenceType().name() : null)
                .setParameter(5, request.getScheduledDate())
                .setParameter(6, request.getScheduledTime())
                .setParameter(7, deliveryDate)
                .setParameter(8, request.getDeliveryTime())
                .setParameter(9, ScheduledOrder.ScheduledOrderStatus.PENDING.name())
                .setParameter(10, nextExecutionDate)
                .setParameter(11, request.getEndDate())
                .setParameter(12, request.getMaxOccurrences())
                .setParameter(13, 0)
                .setParameter(14, cartSnapshotJson)
                .setParameter(15, shippingAddressJson)
                .setParameter(16, request.getDeliveryPoint())
                .setParameter(17, request.getNotes())
                .getSingleResult();
        
        // Reload the entity
        ScheduledOrder savedOrder = scheduledOrderRepository.findById(scheduledOrderId)
                .orElseThrow(() -> new RuntimeException("Failed to create scheduled order"));
        
        // Save order items
        List<ScheduledOrderItem> items = request.getItems().stream()
                .map(item -> {
                    BigDecimal subtotal = item.getWeight() != null && item.getWeight().compareTo(BigDecimal.ZERO) > 0
                        ? item.getPrice().multiply(item.getWeight())
                        : item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    
                    return ScheduledOrderItem.builder()
                            .scheduledOrder(savedOrder)
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .weight(item.getWeight())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());
        
        scheduledOrderItemRepository.saveAll(items);
        
        // Reload to get items
        ScheduledOrder orderWithItems = scheduledOrderRepository.findById(savedOrder.getId())
                .orElseThrow(() -> new RuntimeException("Failed to create scheduled order"));
        
        return toScheduledOrderDto(orderWithItems);
    }
    
    public List<ScheduledOrderDto> getUserScheduledOrders(Long userId) {
        return scheduledOrderRepository.findByUserIdOrderByScheduledDateDesc(userId).stream()
                .map(this::toScheduledOrderDto)
                .collect(Collectors.toList());
    }
    
    public List<ScheduledOrderDto> getUserScheduledOrdersByStatus(Long userId, ScheduledOrder.ScheduledOrderStatus status) {
        return scheduledOrderRepository.findByUserIdAndStatus(userId, status).stream()
                .map(this::toScheduledOrderDto)
                .collect(Collectors.toList());
    }
    
    public List<ScheduledOrderDto> getUserScheduledOrdersByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return scheduledOrderRepository.findByUserIdAndDateRange(userId, startDate, endDate).stream()
                .map(this::toScheduledOrderDto)
                .collect(Collectors.toList());
    }
    
    public ScheduledOrderDto getScheduledOrderById(Long id, Long userId) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        return toScheduledOrderDto(scheduledOrder);
    }
    
    @Transactional
    public ScheduledOrderDto updateScheduledOrder(Long id, Long userId, CreateScheduledOrderRequest request) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        
        // Only allow updates to pending orders
        if (scheduledOrder.getStatus() != ScheduledOrder.ScheduledOrderStatus.PENDING) {
            throw new RuntimeException("Only pending scheduled orders can be updated");
        }
        
        // Update fields
        scheduledOrder.setOrderName(request.getOrderName());
        scheduledOrder.setOrderType(request.getOrderType());
        scheduledOrder.setRecurrenceType(request.getRecurrenceType());
        scheduledOrder.setScheduledDate(request.getScheduledDate());
        scheduledOrder.setScheduledTime(request.getScheduledTime());
        scheduledOrder.setDeliveryDate(request.getDeliveryDate() != null 
            ? request.getDeliveryDate() 
            : request.getScheduledDate());
        scheduledOrder.setDeliveryTime(request.getDeliveryTime());
        scheduledOrder.setEndDate(request.getEndDate());
        scheduledOrder.setMaxOccurrences(request.getMaxOccurrences());
        scheduledOrder.setDeliveryPoint(request.getDeliveryPoint());
        scheduledOrder.setNotes(request.getNotes());
        
        // Recalculate next execution date
        if (request.getOrderType() == ScheduledOrder.OrderType.RECURRING) {
            scheduledOrder.setNextExecutionDate(calculateNextExecutionDate(
                request.getScheduledDate(), 
                request.getRecurrenceType()
            ));
        } else {
            scheduledOrder.setNextExecutionDate(request.getScheduledDate());
        }
        
        // Update cart snapshot
        scheduledOrder.setCartSnapshot(convertCartItemsToJson(request.getItems()));
        scheduledOrder.setShippingAddress(convertShippingAddressToJson(request.getShippingAddress()));
        
        // Delete old items and create new ones
        scheduledOrderItemRepository.deleteByScheduledOrderId(id);
        
        final ScheduledOrder finalScheduledOrder = scheduledOrder;
        List<ScheduledOrderItem> items = request.getItems().stream()
                .map(item -> {
                    BigDecimal subtotal = item.getWeight() != null && item.getWeight().compareTo(BigDecimal.ZERO) > 0
                        ? item.getPrice().multiply(item.getWeight())
                        : item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    
                    return ScheduledOrderItem.builder()
                            .scheduledOrder(finalScheduledOrder)
                            .productId(item.getProductId())
                            .productName(item.getProductName())
                            .price(item.getPrice())
                            .quantity(item.getQuantity())
                            .weight(item.getWeight())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());
        
        scheduledOrderItemRepository.saveAll(items);
        
        ScheduledOrder updatedOrder = scheduledOrderRepository.save(scheduledOrder);
        return toScheduledOrderDto(updatedOrder);
    }
    
    @Transactional
    public void cancelScheduledOrder(Long id, Long userId) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        
        scheduledOrder.setStatus(ScheduledOrder.ScheduledOrderStatus.CANCELLED);
        scheduledOrderRepository.save(scheduledOrder);
    }
    
    @Transactional
    public void pauseScheduledOrder(Long id, Long userId) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        
        if (scheduledOrder.getOrderType() != ScheduledOrder.OrderType.RECURRING) {
            throw new RuntimeException("Only recurring orders can be paused");
        }
        
        scheduledOrder.setStatus(ScheduledOrder.ScheduledOrderStatus.PAUSED);
        scheduledOrderRepository.save(scheduledOrder);
    }
    
    @Transactional
    public void resumeScheduledOrder(Long id, Long userId) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        
        if (scheduledOrder.getStatus() != ScheduledOrder.ScheduledOrderStatus.PAUSED) {
            throw new RuntimeException("Only paused orders can be resumed");
        }
        
        scheduledOrder.setStatus(ScheduledOrder.ScheduledOrderStatus.ACTIVE);
        scheduledOrderRepository.save(scheduledOrder);
    }
    
    @Transactional
    public void deleteScheduledOrder(Long id, Long userId) {
        ScheduledOrder scheduledOrder = scheduledOrderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Scheduled order not found"));
        
        // Only allow deletion of pending or cancelled orders
        if (scheduledOrder.getStatus() != ScheduledOrder.ScheduledOrderStatus.PENDING 
            && scheduledOrder.getStatus() != ScheduledOrder.ScheduledOrderStatus.CANCELLED) {
            throw new RuntimeException("Only pending or cancelled orders can be deleted");
        }
        
        scheduledOrderRepository.delete(scheduledOrder);
    }
    
    // Helper method to calculate next execution date for recurring orders
    private LocalDate calculateNextExecutionDate(LocalDate currentDate, ScheduledOrder.RecurrenceType recurrenceType) {
        switch (recurrenceType) {
            case DAILY:
                return currentDate.plusDays(1);
            case WEEKLY:
                return currentDate.plusWeeks(1);
            case MONTHLY:
                return currentDate.plusMonths(1);
            default:
                return currentDate;
        }
    }
    
    // Helper method to convert cart items to JSON
    private String convertCartItemsToJson(List<CartItemSnapshot> items) {
        try {
            return objectMapper.writeValueAsString(items);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize cart items", e);
        }
    }
    
    // Helper method to convert shipping address to JSON
    private String convertShippingAddressToJson(ShippingAddress address) {
        try {
            return objectMapper.writeValueAsString(address);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize shipping address", e);
        }
    }
    
    // Helper method to convert JSON to shipping address
    private ShippingAddress convertJsonToShippingAddress(String json) {
        try {
            return objectMapper.readValue(json, ShippingAddress.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize shipping address", e);
        }
    }
    
    // Helper method to convert JSON to cart items
    private List<CartItemSnapshot> convertJsonToCartItems(String json) {
        try {
            return objectMapper.readValue(json, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, CartItemSnapshot.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize cart items", e);
        }
    }
    
    // Convert ScheduledOrder entity to DTO
    private ScheduledOrderDto toScheduledOrderDto(ScheduledOrder scheduledOrder) {
        List<ScheduledOrderItemDto> itemDtos = scheduledOrder.getItems() != null
            ? scheduledOrder.getItems().stream()
                .map(this::toScheduledOrderItemDto)
                .collect(Collectors.toList())
            : Collections.emptyList();
        
        ShippingAddress shippingAddress = null;
        if (scheduledOrder.getShippingAddress() != null) {
            shippingAddress = convertJsonToShippingAddress(scheduledOrder.getShippingAddress());
        }
        
        return ScheduledOrderDto.builder()
                .id(scheduledOrder.getId())
                .userId(scheduledOrder.getUserId())
                .orderName(scheduledOrder.getOrderName())
                .orderType(scheduledOrder.getOrderType())
                .recurrenceType(scheduledOrder.getRecurrenceType())
                .scheduledDate(scheduledOrder.getScheduledDate())
                .scheduledTime(scheduledOrder.getScheduledTime())
                .deliveryDate(scheduledOrder.getDeliveryDate())
                .deliveryTime(scheduledOrder.getDeliveryTime())
                .status(scheduledOrder.getStatus())
                .nextExecutionDate(scheduledOrder.getNextExecutionDate())
                .endDate(scheduledOrder.getEndDate())
                .maxOccurrences(scheduledOrder.getMaxOccurrences())
                .currentOccurrence(scheduledOrder.getCurrentOccurrence())
                .items(itemDtos)
                .shippingAddress(shippingAddress)
                .deliveryPoint(scheduledOrder.getDeliveryPoint())
                .notes(scheduledOrder.getNotes())
                .createdAt(scheduledOrder.getCreatedAt())
                .updatedAt(scheduledOrder.getUpdatedAt())
                .build();
    }
    
    // Convert ScheduledOrderItem entity to DTO
    private ScheduledOrderItemDto toScheduledOrderItemDto(ScheduledOrderItem item) {
        return ScheduledOrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .weight(item.getWeight())
                .subtotal(item.getSubtotal())
                .build();
    }
}

