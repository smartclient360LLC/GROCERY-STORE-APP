package com.grocerystore.order.repository;

import com.grocerystore.order.model.CarbonFootprintHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CarbonFootprintHistoryRepository extends JpaRepository<CarbonFootprintHistory, Long> {
    List<CarbonFootprintHistory> findByUserIdOrderByOrderDateDesc(Long userId);
    List<CarbonFootprintHistory> findByUserIdAndOrderDateBetween(Long userId, java.time.LocalDate startDate, java.time.LocalDate endDate);
}

