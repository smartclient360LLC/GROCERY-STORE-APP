package com.grocerystore.order.repository;

import com.grocerystore.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCreatedAtBetweenAndStatusIn(LocalDateTime start, LocalDateTime end, List<Order.OrderStatus> statuses);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByIsPosOrderOrderByCreatedAtDesc(Boolean isPosOrder);
}

