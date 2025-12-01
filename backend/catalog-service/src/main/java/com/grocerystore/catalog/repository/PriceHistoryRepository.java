package com.grocerystore.catalog.repository;

import com.grocerystore.catalog.model.PriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {
    List<PriceHistory> findByProductIdOrderByRecordedAtDesc(Long productId);
    
    @Query("SELECT ph FROM PriceHistory ph WHERE ph.productId = :productId ORDER BY ph.recordedAt DESC")
    List<PriceHistory> findLatestByProductId(@Param("productId") Long productId);
    
    Optional<PriceHistory> findFirstByProductIdOrderByRecordedAtDesc(Long productId);
    
    @Query("SELECT ph FROM PriceHistory ph WHERE ph.recordedAt >= :since ORDER BY ph.recordedAt DESC")
    List<PriceHistory> findRecentPriceChanges(@Param("since") LocalDateTime since);
}

