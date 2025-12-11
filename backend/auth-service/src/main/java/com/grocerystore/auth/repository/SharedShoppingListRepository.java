package com.grocerystore.auth.repository;

import com.grocerystore.auth.model.SharedShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedShoppingListRepository extends JpaRepository<SharedShoppingList, Long> {
    List<SharedShoppingList> findByFamilyAccountIdOrderByIsDefaultDescCreatedAtDesc(Long familyAccountId);
    
    Optional<SharedShoppingList> findByIdAndFamilyAccountId(Long id, Long familyAccountId);
    
    @Query("SELECT ssl FROM SharedShoppingList ssl JOIN ssl.familyAccount fa JOIN fa.members fm " +
           "WHERE fm.userId = :userId AND fm.isActive = true ORDER BY ssl.isDefault DESC, ssl.createdAt DESC")
    List<SharedShoppingList> findByUserId(@Param("userId") Long userId);
}

