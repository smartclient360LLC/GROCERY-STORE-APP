package com.grocerystore.auth.repository;

import com.grocerystore.auth.model.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByFamilyAccountId(Long familyAccountId);
    
    Optional<FamilyMember> findByFamilyAccountIdAndUserId(Long familyAccountId, Long userId);
    
    List<FamilyMember> findByUserId(Long userId);
    
    boolean existsByFamilyAccountIdAndUserId(Long familyAccountId, Long userId);
}

