package com.grocerystore.order.repository;

import com.grocerystore.order.model.ScheduledOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduledOrderItemRepository extends JpaRepository<ScheduledOrderItem, Long> {
    List<ScheduledOrderItem> findByScheduledOrderId(Long scheduledOrderId);
    void deleteByScheduledOrderId(Long scheduledOrderId);
}

