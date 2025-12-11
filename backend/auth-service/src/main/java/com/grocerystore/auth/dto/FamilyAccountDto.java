package com.grocerystore.auth.dto;

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
public class FamilyAccountDto {
    private Long id;
    private String familyName;
    private Long createdByUserId;
    private List<FamilyMemberDto> members;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

