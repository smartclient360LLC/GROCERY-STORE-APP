package com.grocerystore.auth.dto;

import com.grocerystore.auth.model.FamilyMember;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyMemberDto {
    private Long id;
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private FamilyMember.MemberRole memberRole;
    private String memberName;
    private List<String> preferences;
    private List<String> allergies;
    private Boolean isActive;
    private LocalDateTime joinedAt;
}

