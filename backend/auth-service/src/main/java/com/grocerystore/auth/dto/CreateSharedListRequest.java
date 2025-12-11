package com.grocerystore.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSharedListRequest {
    @NotBlank(message = "List name is required")
    private String listName;
    
    private Boolean isDefault;
}

