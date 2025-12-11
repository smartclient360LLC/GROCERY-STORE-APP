package com.grocerystore.catalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocerystore.catalog.dto.RecipeDto;
import com.grocerystore.catalog.dto.RecipeIngredientDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Slf4j
public class TheMealDbService {
    
    private static final String THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public TheMealDbService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Fetch recipes from TheMealDB
     * Fetch recipes by searching common letters for better performance
     */
    public List<RecipeDto> getAllRecipes() {
        List<RecipeDto> allRecipes = new ArrayList<>();
        Set<String> seenIds = new HashSet<>();
        
        try {
            // Fetch recipes by searching common letters (a, b, c, d, e) for faster results
            char[] commonLetters = {'a', 'b', 'c', 'd', 'e'};
            
            for (char letter : commonLetters) {
                try {
                    String url = THEMEALDB_BASE_URL + "search.php?f=" + letter;
                    String response = restTemplate.getForObject(url, String.class);
                    
                    if (response != null && !response.contains("\"meals\":null")) {
                        JsonNode root = objectMapper.readTree(response);
                        JsonNode meals = root.get("meals");
                        
                        if (meals != null && meals.isArray()) {
                            for (JsonNode meal : meals) {
                                String mealId = meal.has("idMeal") ? meal.get("idMeal").asText("") : "";
                                if (!mealId.isEmpty() && !seenIds.contains(mealId)) {
                                    RecipeDto recipe = mapToRecipeDto(meal);
                                    if (recipe != null) {
                                        allRecipes.add(recipe);
                                        seenIds.add(mealId);
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error fetching recipes for letter {}: {}", letter, e.getMessage());
                }
            }
            
            // If we don't have enough recipes, add some random ones
            if (allRecipes.size() < 20) {
                List<RecipeDto> randomRecipes = getRandomRecipes(20 - allRecipes.size());
                for (RecipeDto recipe : randomRecipes) {
                    if (recipe != null && recipe.getId() != null) {
                        String recipeId = String.valueOf(recipe.getId());
                        if (!seenIds.contains(recipeId)) {
                            allRecipes.add(recipe);
                            seenIds.add(recipeId);
                        }
                    }
                }
            }
            
            log.info("Fetched {} recipes from TheMealDB", allRecipes.size());
            return allRecipes;
        } catch (Exception e) {
            log.error("Error fetching all recipes from TheMealDB", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Fetch random recipes from TheMealDB
     */
    public List<RecipeDto> getRandomRecipes(int count) {
        List<RecipeDto> recipes = new ArrayList<>();
        
        try {
            // Fetch multiple random recipes in parallel (TheMealDB allows this)
            for (int i = 0; i < Math.min(count, 10); i++) {
                try {
                    String url = THEMEALDB_BASE_URL + "random.php";
                    String response = restTemplate.getForObject(url, String.class);
                    
                    if (response != null && !response.contains("\"meals\":null")) {
                        JsonNode root = objectMapper.readTree(response);
                        JsonNode meals = root.get("meals");
                        
                        if (meals != null && meals.isArray() && meals.size() > 0) {
                            RecipeDto recipe = mapToRecipeDto(meals.get(0));
                            if (recipe != null) {
                                recipes.add(recipe);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error fetching random recipe: {}", e.getMessage());
                }
            }
            
            return recipes;
        } catch (Exception e) {
            log.error("Error fetching random recipes from TheMealDB", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Search recipes by name
     */
    public List<RecipeDto> searchRecipes(String searchTerm) {
        try {
            String url = THEMEALDB_BASE_URL + "search.php?s=" + searchTerm;
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null || response.contains("\"meals\":null")) {
                return new ArrayList<>();
            }
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode meals = root.get("meals");
            
            if (meals == null || !meals.isArray()) {
                return new ArrayList<>();
            }
            
            return StreamSupport.stream(meals.spliterator(), false)
                    .map(this::mapToRecipeDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching recipes from TheMealDB", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * Get recipe by ID
     */
    public RecipeDto getRecipeById(String id) {
        try {
            String url = THEMEALDB_BASE_URL + "lookup.php?i=" + id;
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null || response.contains("\"meals\":null")) {
                return null;
            }
            
            JsonNode root = objectMapper.readTree(response);
            JsonNode meals = root.get("meals");
            
            if (meals == null || !meals.isArray() || meals.size() == 0) {
                return null;
            }
            
            return mapToRecipeDto(meals.get(0));
        } catch (Exception e) {
            log.error("Error fetching recipe by ID from TheMealDB", e);
            return null;
        }
    }
    
    /**
     * Parse quantity string to BigDecimal
     */
    private java.math.BigDecimal parseQuantity(String quantityStr) {
        try {
            return new java.math.BigDecimal(quantityStr);
        } catch (Exception e) {
            return java.math.BigDecimal.ONE;
        }
    }
    
    /**
     * Map TheMealDB JSON response to RecipeDto
     */
    private RecipeDto mapToRecipeDto(JsonNode meal) {
        if (meal == null) {
            return null;
        }
        
        // Extract ingredients
        List<RecipeIngredientDto> ingredients = new ArrayList<>();
        for (int i = 1; i <= 20; i++) {
            String ingredient = meal.has("strIngredient" + i) 
                ? meal.get("strIngredient" + i).asText("") 
                : "";
            String measure = meal.has("strMeasure" + i) 
                ? meal.get("strMeasure" + i).asText("") 
                : "";
            
            if (ingredient != null && !ingredient.trim().isEmpty()) {
                // Parse quantity from measure string (e.g., "1 cup" -> quantity=1, unit="cup")
                String quantityStr = "1";
                String unitStr = "";
                if (measure != null && !measure.trim().isEmpty()) {
                    String measureTrimmed = measure.trim();
                    // Try to extract number from measure
                    String[] parts = measureTrimmed.split("\\s+", 2);
                    if (parts.length > 0 && parts[0].matches("\\d+(\\.\\d+)?")) {
                        quantityStr = parts[0];
                        if (parts.length > 1) {
                            unitStr = parts[1];
                        }
                    } else {
                        unitStr = measureTrimmed;
                    }
                }
                
                ingredients.add(RecipeIngredientDto.builder()
                        .productName(ingredient.trim())
                        .quantity(parseQuantity(quantityStr))
                        .unit(unitStr)
                        .build());
            }
        }
        
        // Extract instructions and split by newlines
        String instructions = meal.has("strInstructions") 
            ? meal.get("strInstructions").asText("") 
            : "";
        
        // Use meal ID as a unique identifier
        // Try to parse as Long, if not possible, use hash
        String mealId = meal.has("idMeal") ? meal.get("idMeal").asText("") : "";
        Long id = null;
        if (!mealId.isEmpty()) {
            try {
                id = Long.parseLong(mealId);
            } catch (NumberFormatException e) {
                // If not a number, use hash
                id = (long) Math.abs(mealId.hashCode());
            }
        }
        
        return RecipeDto.builder()
                .id(id)
                .name(meal.has("strMeal") ? meal.get("strMeal").asText("") : "Unknown Recipe")
                .description(meal.has("strInstructions") 
                    ? meal.get("strInstructions").asText("").substring(0, Math.min(200, meal.get("strInstructions").asText("").length()))
                    : "")
                .cuisineType(meal.has("strArea") ? meal.get("strArea").asText("") : "International")
                .cookingTime(null) // TheMealDB doesn't provide cooking time
                .servings(null) // TheMealDB doesn't provide servings
                .difficulty(null) // TheMealDB doesn't provide difficulty
                .imageUrl(meal.has("strMealThumb") ? meal.get("strMealThumb").asText("") : null)
                .instructions(instructions)
                .ingredients(ingredients)
                .build();
    }
}

