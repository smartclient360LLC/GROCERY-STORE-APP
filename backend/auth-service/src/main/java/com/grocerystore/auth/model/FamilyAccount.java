package com.grocerystore.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "family_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "family_name", nullable = false)
    private String familyName;
    
    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;
    
    @OneToMany(mappedBy = "familyAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FamilyMember> members;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

