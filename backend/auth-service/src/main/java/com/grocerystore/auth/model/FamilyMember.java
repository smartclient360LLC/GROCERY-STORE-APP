package com.grocerystore.auth.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_account_id", nullable = false)
    private FamilyAccount familyAccount;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "member_role", nullable = false)
    @Builder.Default
    private MemberRole memberRole = MemberRole.MEMBER;
    
    @Column(name = "member_name")
    private String memberName; // Display name like "Mom", "Dad", "John"
    
    @Column(columnDefinition = "TEXT")
    private String preferences; // JSON string for dietary preferences
    
    @Column(columnDefinition = "TEXT")
    private String allergies; // JSON array of allergies
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;
    
    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
    
    public enum MemberRole {
        OWNER, MEMBER, CHILD
    }
}

