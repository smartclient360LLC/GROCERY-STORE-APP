package com.grocerystore.catalog.repository;

import com.grocerystore.catalog.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryIdAndActiveTrue(Long categoryId);
    List<Product> findByActiveTrue();
    
    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity > 0")
    List<Product> findAvailableProducts();
    
    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.active = true AND p.stockQuantity > 0")
    List<Product> findAvailableProductsByCategory(@Param("categoryId") Long categoryId);
    
    java.util.Optional<Product> findByProductCode(String productCode);
    
    long countByCategoryId(Long categoryId);
}

