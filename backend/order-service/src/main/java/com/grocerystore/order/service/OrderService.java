package com.grocerystore.order.service;

import com.grocerystore.order.dto.CreateOrderRequest;
import com.grocerystore.order.dto.FrequentlyOrderedProductDto;
import com.grocerystore.order.dto.OrderDto;
import com.grocerystore.order.dto.OrderItemDto;
import com.grocerystore.order.dto.SalesReportDto;
import com.grocerystore.order.model.Order;
import com.grocerystore.order.model.OrderItem;
import com.grocerystore.order.repository.OrderRepository;
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
    private final RabbitTemplate rabbitTemplate;
    
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
        
        // Publish order created event
        publishOrderCreatedEvent(savedOrder);
        
        return toOrderDto(savedOrder);
    }
    
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return toOrderDto(order);
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
        order.setStatus(status);
        order = orderRepository.save(order);
        return toOrderDto(order);
    }
    
    @Transactional
    public OrderDto updateOrderStatusByOrderNumber(String orderNumber, Order.OrderStatus status) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        order = orderRepository.save(order);
        return toOrderDto(order);
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
}

