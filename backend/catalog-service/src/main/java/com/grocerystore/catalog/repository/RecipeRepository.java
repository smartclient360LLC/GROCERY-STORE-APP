package com.grocerystore.catalog.repository;

import com.grocerystore.catalog.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByCuisineType(String cuisineType);
    Optional<Recipe> findByNameContainingIgnoreCase(String name);
    List<Recipe> findAllByOrderByCreatedAtDesc();
}

