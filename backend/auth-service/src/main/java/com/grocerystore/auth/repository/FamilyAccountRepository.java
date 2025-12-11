package com.grocerystore.auth.repository;

import com.grocerystore.auth.model.FamilyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyAccountRepository extends JpaRepository<FamilyAccount, Long> {
    @Query("SELECT fa FROM FamilyAccount fa JOIN fa.members fm WHERE fm.userId = :userId AND fm.isActive = true")
    List<FamilyAccount> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT fa FROM FamilyAccount fa JOIN fa.members fm WHERE fa.id = :familyId AND fm.userId = :userId AND fm.isActive = true")
    Optional<FamilyAccount> findByIdAndUserId(@Param("familyId") Long familyId, @Param("userId") Long userId);
}

