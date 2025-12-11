package com.grocerystore.order.repository;

import com.grocerystore.order.model.ScheduledOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledOrderRepository extends JpaRepository<ScheduledOrder, Long> {
    List<ScheduledOrder> findByUserIdOrderByScheduledDateDesc(Long userId);
    
    List<ScheduledOrder> findByUserIdAndStatus(Long userId, ScheduledOrder.ScheduledOrderStatus status);
    
    @Query("SELECT so FROM ScheduledOrder so WHERE so.status IN ('PENDING', 'ACTIVE') " +
           "AND so.nextExecutionDate <= :date ORDER BY so.nextExecutionDate ASC")
    List<ScheduledOrder> findOrdersToExecute(@Param("date") LocalDate date);
    
    @Query("SELECT so FROM ScheduledOrder so WHERE so.userId = :userId " +
           "AND so.scheduledDate BETWEEN :startDate AND :endDate " +
           "ORDER BY so.scheduledDate ASC")
    List<ScheduledOrder> findByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    Optional<ScheduledOrder> findByIdAndUserId(Long id, Long userId);
}

