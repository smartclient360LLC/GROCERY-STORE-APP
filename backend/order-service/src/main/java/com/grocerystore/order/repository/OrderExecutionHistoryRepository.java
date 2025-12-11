package com.grocerystore.order.repository;

import com.grocerystore.order.model.OrderExecutionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderExecutionHistoryRepository extends JpaRepository<OrderExecutionHistory, Long> {
    List<OrderExecutionHistory> findByScheduledOrderIdOrderByExecutionDateDesc(Long scheduledOrderId);
}

