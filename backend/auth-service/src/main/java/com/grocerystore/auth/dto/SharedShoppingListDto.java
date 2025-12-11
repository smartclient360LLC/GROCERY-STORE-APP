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
public class SharedShoppingListDto {
    private Long id;
    private Long familyAccountId;
    private String listName;
    private Long createdByUserId;
    private String createdByName;
    private Boolean isDefault;
    private List<SharedListItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

