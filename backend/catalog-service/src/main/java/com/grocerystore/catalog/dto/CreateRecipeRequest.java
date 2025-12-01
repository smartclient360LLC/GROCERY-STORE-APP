package com.grocerystore.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateRecipeRequest {
    @NotBlank(message = "Recipe name is required")
    private String name;
    
    private String description;
    private String cuisineType;
    private Integer cookingTime;
    private Integer servings;
    private String difficulty;
    private String imageUrl;
    private String instructions;
    
    @NotEmpty(message = "Recipe must have at least one ingredient")
    @Valid
    private List<RecipeIngredientDto> ingredients;
}

