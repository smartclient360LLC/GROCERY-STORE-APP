package com.grocerystore.catalog.controller;

import com.grocerystore.catalog.dto.CategoryDto;
import com.grocerystore.catalog.dto.CreateRecipeRequest;
import com.grocerystore.catalog.dto.PriceHistoryDto;
import com.grocerystore.catalog.dto.ProductDto;
import com.grocerystore.catalog.dto.RecipeDto;
import com.grocerystore.catalog.dto.WishlistDto;
import com.grocerystore.catalog.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CatalogController {
    
    private final CatalogService catalogService;
    
    @GetMapping("/products")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(catalogService.getAllProducts());
    }
    
    @GetMapping("/products/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductDto>> getAllProductsForAdmin() {
        return ResponseEntity.ok(catalogService.getAllProductsForAdmin());
    }
    
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable Long id) {
        try {
            // For customers, check availability
            return ResponseEntity.ok(catalogService.getProductByIdForCustomer(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/products/{id}/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDto> getProductByIdForAdmin(@PathVariable Long id) {
        try {
            // Admin can see any product
            return ResponseEntity.ok(catalogService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ProductDto>> getProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(catalogService.getProductsByCategory(categoryId));
    }
    
    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@RequestBody ProductDto productDto) {
        try {
            // Validate required fields
            if (productDto.getName() == null || productDto.getName().trim().isEmpty()) {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Product name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (productDto.getPrice() == null) {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Product price is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (productDto.getStockQuantity() == null) {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Stock quantity is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            if (productDto.getCategoryId() == null) {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Category is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(catalogService.createProduct(productDto));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create product");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        } catch (Exception e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", "Unexpected error: " + e.getMessage());
            error.put("error", "Internal Server Error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(error);
        }
    }
    
    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDto productDto) {
        try {
            return ResponseEntity.ok(catalogService.updateProduct(id, productDto));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update product");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        }
    }
    
    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            catalogService.deleteProduct(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete product");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        return ResponseEntity.ok(catalogService.getAllCategories());
    }
    
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryDto> getCategoryById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(catalogService.getCategoryById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@RequestBody CategoryDto categoryDto) {
        try {
            if (categoryDto.getName() == null || categoryDto.getName().trim().isEmpty()) {
                java.util.Map<String, String> error = new java.util.HashMap<>();
                error.put("message", "Category name is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(catalogService.createCategory(categoryDto));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create category");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        }
    }
    
    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryDto categoryDto) {
        try {
            return ResponseEntity.ok(catalogService.updateCategory(id, categoryDto));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update category");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        }
    }
    
    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            catalogService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete category");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(error);
        }
    }
    
    // ========== Recipe Endpoints ==========
    
    @GetMapping("/recipes")
    public ResponseEntity<List<RecipeDto>> getAllRecipes() {
        // Fetch from TheMealDB API instead of database
        return ResponseEntity.ok(catalogService.getAllRecipesFromApi());
    }
    
    @GetMapping("/recipes/{id}")
    public ResponseEntity<RecipeDto> getRecipeById(@PathVariable String id) {
        try {
            // Try to get from API first (TheMealDB uses string IDs)
            RecipeDto recipe = catalogService.getRecipeByIdFromApi(id);
            if (recipe != null) {
                return ResponseEntity.ok(recipe);
            }
            // Fallback to database if not found in API
            try {
                Long dbId = Long.parseLong(id);
                return ResponseEntity.ok(catalogService.getRecipeById(dbId));
            } catch (NumberFormatException e) {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/recipes/cuisine/{cuisineType}")
    public ResponseEntity<List<RecipeDto>> getRecipesByCuisine(@PathVariable String cuisineType) {
        return ResponseEntity.ok(catalogService.getRecipesByCuisine(cuisineType));
    }
    
    @GetMapping("/recipes/api/random")
    public ResponseEntity<List<RecipeDto>> getRandomRecipes(
            @RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(catalogService.getRandomRecipesFromApi(count));
    }
    
    @GetMapping("/recipes/api/search")
    public ResponseEntity<List<RecipeDto>> searchRecipes(
            @RequestParam String q) {
        return ResponseEntity.ok(catalogService.searchRecipesFromApi(q));
    }
    
    @PostMapping("/recipes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createRecipe(@Valid @RequestBody CreateRecipeRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(catalogService.createRecipe(request));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create recipe");
            error.put("error", "Bad Request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== Wishlist Endpoints ==========
    
    @GetMapping("/wishlist/{userId}")
    public ResponseEntity<List<WishlistDto>> getUserWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(catalogService.getUserWishlist(userId));
    }
    
    @PostMapping("/wishlist/{userId}/products/{productId}")
    public ResponseEntity<?> addToWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam(required = false) BigDecimal targetPrice) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(catalogService.addToWishlist(userId, productId, targetPrice));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to add to wishlist");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/wishlist/{userId}/products/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        try {
            catalogService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to remove from wishlist");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/wishlist/{userId}/products/{productId}")
    public ResponseEntity<?> updateWishlistSettings(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestParam(required = false) Boolean notifyOnPriceDrop,
            @RequestParam(required = false) Boolean notifyWhenInStock,
            @RequestParam(required = false) BigDecimal targetPrice) {
        try {
            return ResponseEntity.ok(catalogService.updateWishlistSettings(
                    userId, productId, notifyOnPriceDrop, notifyWhenInStock, targetPrice));
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update wishlist settings");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/products/{productId}/price-history")
    public ResponseEntity<List<PriceHistoryDto>> getPriceHistory(@PathVariable Long productId) {
        return ResponseEntity.ok(catalogService.getPriceHistory(productId));
    }
    
    // Internal endpoint for updating stock (called by order-service)
    @PutMapping("/products/{productId}/stock")
    public ResponseEntity<?> updateProductStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        try {
            catalogService.updateStock(productId, quantity);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            java.util.Map<String, String> error = new java.util.HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update stock");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

