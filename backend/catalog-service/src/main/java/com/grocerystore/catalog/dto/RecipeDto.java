package com.grocerystore.catalog.dto;

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
public class RecipeDto {
    private Long id;
    private String name;
    private String description;
    private String cuisineType;
    private Integer cookingTime;
    private Integer servings;
    private String difficulty;
    private String imageUrl;
    private String instructions;
    private List<RecipeIngredientDto> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

