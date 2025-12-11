package com.grocerystore.catalog.service;

import com.grocerystore.catalog.dto.CategoryDto;
import com.grocerystore.catalog.dto.CreateRecipeRequest;
import com.grocerystore.catalog.dto.PriceHistoryDto;
import com.grocerystore.catalog.dto.ProductDto;
import com.grocerystore.catalog.dto.RecipeDto;
import com.grocerystore.catalog.dto.RecipeIngredientDto;
import com.grocerystore.catalog.dto.WishlistDto;
import com.grocerystore.catalog.model.Category;
import com.grocerystore.catalog.model.PriceHistory;
import com.grocerystore.catalog.model.Product;
import com.grocerystore.catalog.model.Recipe;
import com.grocerystore.catalog.model.RecipeIngredient;
import com.grocerystore.catalog.model.Wishlist;
import com.grocerystore.catalog.repository.CategoryRepository;
import com.grocerystore.catalog.repository.PriceHistoryRepository;
import com.grocerystore.catalog.repository.ProductRepository;
import com.grocerystore.catalog.repository.RecipeRepository;
import com.grocerystore.catalog.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogService {
    
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;
    private final WishlistRepository wishlistRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final TheMealDbService theMealDbService;
    
    public List<ProductDto> getAllProducts() {
        // Customers only see available products (active AND in stock)
        return productRepository.findAvailableProducts().stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }
    
    public List<ProductDto> getAllProductsForAdmin() {
        // Admin can see all products including inactive ones
        return productRepository.findAll().stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }
    
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toProductDto(product);
    }
    
    public List<ProductDto> getProductsByCategory(Long categoryId) {
        // Customers only see available products (active AND in stock)
        return productRepository.findAvailableProductsByCategory(categoryId).stream()
                .map(this::toProductDto)
                .collect(Collectors.toList());
    }
    
    public ProductDto getProductByIdForCustomer(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        // Check if product is available
        if (!product.getActive() || product.getStockQuantity() <= 0) {
            throw new RuntimeException("Product not available");
        }
        return toProductDto(product);
    }
    
    @Transactional
    public ProductDto createProduct(ProductDto productDto) {
        Category category = categoryRepository.findById(productDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Normalize product code (trim and check)
        final String productCode;
        if (productDto.getProductCode() != null && !productDto.getProductCode().trim().isEmpty()) {
            productCode = productDto.getProductCode().trim();
            
            // Check if productCode already exists (case-sensitive check)
            final String codeToCheck = productCode; // Make effectively final for lambda
            productRepository.findByProductCode(codeToCheck)
                    .ifPresent(p -> {
                        throw new RuntimeException("Product code already exists: " + codeToCheck);
                    });
        } else {
            productCode = null;
        }
        
        Product product = Product.builder()
                .name(productDto.getName())
                .description(productDto.getDescription())
                .price(productDto.getPrice())
                .stockQuantity(productDto.getStockQuantity())
                .imageUrl(productDto.getImageUrl())
                .productCode(productCode)
                .category(category)
                .active(productDto.getActive() != null ? productDto.getActive() : true)
                .build();
        
        try {
            product = productRepository.save(product);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Extract more specific error message
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("product_code") || errorMessage.contains("unique") || errorMessage.contains("duplicate")) {
                    throw new RuntimeException("Product code already exists. Please use a different product code.");
                } else if (errorMessage.contains("foreign key") || errorMessage.contains("category")) {
                    throw new RuntimeException("Invalid category selected.");
                } else {
                    throw new RuntimeException("Data validation failed: " + errorMessage);
                }
            }
            throw new RuntimeException("Product code already exists or invalid data. Please check all fields.");
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e; // Re-throw our custom exceptions
            }
            throw new RuntimeException("Failed to create product: " + e.getMessage());
        }
        
        return toProductDto(product);
    }
    
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto productDto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Track price change if price is being updated
        BigDecimal oldPrice = product.getPrice();
        if (productDto.getPrice() != null && !productDto.getPrice().equals(oldPrice)) {
            // Record price history
            PriceHistory priceHistory = PriceHistory.builder()
                    .productId(product.getId())
                    .price(oldPrice) // Record the old price before change
                    .build();
            priceHistoryRepository.save(priceHistory);
        }
        
        if (productDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }
        
        if (productDto.getName() != null) product.setName(productDto.getName());
        if (productDto.getDescription() != null) product.setDescription(productDto.getDescription());
        if (productDto.getPrice() != null) product.setPrice(productDto.getPrice());
        if (productDto.getStockQuantity() != null) product.setStockQuantity(productDto.getStockQuantity());
        if (productDto.getImageUrl() != null) product.setImageUrl(productDto.getImageUrl());
        
        // Handle productCode update with uniqueness check
        if (productDto.getProductCode() != null) {
            String newCode = productDto.getProductCode().trim();
            if (newCode.isEmpty()) {
                product.setProductCode(null);
            } else {
                // Check if productCode is being changed and if new code already exists
                if (!newCode.equals(product.getProductCode())) {
                    productRepository.findByProductCode(newCode)
                            .ifPresent(p -> {
                                if (!p.getId().equals(id)) {
                                    throw new RuntimeException("Product code already exists: " + newCode);
                                }
                            });
                }
                product.setProductCode(newCode);
            }
        }
        
        if (productDto.getActive() != null) product.setActive(productDto.getActive());
        
        try {
            product = productRepository.save(product);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Extract more specific error message
            String errorMessage = e.getMessage();
            if (errorMessage != null) {
                if (errorMessage.contains("product_code") || errorMessage.contains("unique") || errorMessage.contains("duplicate")) {
                    throw new RuntimeException("Product code already exists. Please use a different product code.");
                } else if (errorMessage.contains("foreign key") || errorMessage.contains("category")) {
                    throw new RuntimeException("Invalid category selected.");
                } else {
                    throw new RuntimeException("Data validation failed: " + errorMessage);
                }
            }
            throw new RuntimeException("Product code already exists or invalid data. Please check all fields.");
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e; // Re-throw our custom exceptions
            }
            throw new RuntimeException("Failed to update product: " + e.getMessage());
        }
        
        return toProductDto(product);
    }
    
    @Transactional
    public void updateStock(Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }
    
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
    }
    
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return toCategoryDto(category);
    }
    
    @Transactional
    public CategoryDto createCategory(CategoryDto categoryDto) {
        // Check if category name already exists
        if (categoryRepository.findByName(categoryDto.getName()).isPresent()) {
            throw new RuntimeException("Category name already exists: " + categoryDto.getName());
        }
        
        Category category = Category.builder()
                .name(categoryDto.getName())
                .description(categoryDto.getDescription())
                .build();
        try {
            category = categoryRepository.save(category);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Category name already exists or invalid data");
        }
        return toCategoryDto(category);
    }
    
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Check if new name conflicts with existing category
        if (categoryDto.getName() != null && !categoryDto.getName().equals(category.getName())) {
            categoryRepository.findByName(categoryDto.getName())
                    .ifPresent(c -> {
                        if (!c.getId().equals(id)) {
                            throw new RuntimeException("Category name already exists: " + categoryDto.getName());
                        }
                    });
        }
        
        if (categoryDto.getName() != null) category.setName(categoryDto.getName());
        if (categoryDto.getDescription() != null) category.setDescription(categoryDto.getDescription());
        
        try {
            category = categoryRepository.save(category);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Category name already exists or invalid data");
        }
        
        return toCategoryDto(category);
    }
    
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Check if category has products
        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new RuntimeException("Cannot delete category: " + productCount + " product(s) are associated with this category");
        }
        
        categoryRepository.delete(category);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        productRepository.delete(product);
    }
    
    private ProductDto toProductDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .productCode(product.getProductCode())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .active(product.getActive())
                .build();
    }
    
    private CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
    
    // ========== Recipe Methods ==========
    
    public List<RecipeDto> getAllRecipes() {
        return recipeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toRecipeDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all recipes from TheMealDB API
     */
    public List<RecipeDto> getAllRecipesFromApi() {
        return theMealDbService.getAllRecipes();
    }
    
    /**
     * Get random recipes from TheMealDB API
     */
    public List<RecipeDto> getRandomRecipesFromApi(int count) {
        return theMealDbService.getRandomRecipes(count);
    }
    
    /**
     * Search recipes from TheMealDB API
     */
    public List<RecipeDto> searchRecipesFromApi(String searchTerm) {
        return theMealDbService.searchRecipes(searchTerm);
    }
    
    /**
     * Get recipe by ID from TheMealDB API
     */
    public RecipeDto getRecipeByIdFromApi(String id) {
        return theMealDbService.getRecipeById(id);
    }
    
    public List<RecipeDto> getRecipesByCuisine(String cuisineType) {
        // Filter API recipes by cuisine
        List<RecipeDto> allRecipes = getAllRecipesFromApi();
        return allRecipes.stream()
                .filter(recipe -> recipe.getCuisineType() != null 
                    && recipe.getCuisineType().equalsIgnoreCase(cuisineType))
                .collect(Collectors.toList());
    }
    
    public RecipeDto getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return toRecipeDto(recipe);
    }
    
    @Transactional
    public RecipeDto createRecipe(CreateRecipeRequest request) {
        Recipe recipe = Recipe.builder()
                .name(request.getName())
                .description(request.getDescription())
                .cuisineType(request.getCuisineType())
                .cookingTime(request.getCookingTime())
                .servings(request.getServings())
                .difficulty(request.getDifficulty())
                .imageUrl(request.getImageUrl())
                .instructions(request.getInstructions())
                .build();
        
        // Create ingredients
        List<RecipeIngredient> ingredients = request.getIngredients().stream()
                .map(ingDto -> RecipeIngredient.builder()
                        .recipe(recipe)
                        .productId(ingDto.getProductId())
                        .productName(ingDto.getProductName())
                        .quantity(ingDto.getQuantity())
                        .unit(ingDto.getUnit())
                        .notes(ingDto.getNotes())
                        .build())
                .collect(Collectors.toList());
        
        recipe.setIngredients(ingredients);
        Recipe savedRecipe = recipeRepository.save(recipe);
        return toRecipeDto(savedRecipe);
    }
    
    private RecipeDto toRecipeDto(Recipe recipe) {
        List<RecipeIngredientDto> ingredientDtos = recipe.getIngredients().stream()
                .map(this::toRecipeIngredientDto)
                .collect(Collectors.toList());
        
        return RecipeDto.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .description(recipe.getDescription())
                .cuisineType(recipe.getCuisineType())
                .cookingTime(recipe.getCookingTime())
                .servings(recipe.getServings())
                .difficulty(recipe.getDifficulty())
                .imageUrl(recipe.getImageUrl())
                .instructions(recipe.getInstructions())
                .ingredients(ingredientDtos)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }
    
    private RecipeIngredientDto toRecipeIngredientDto(RecipeIngredient ing) {
        // Check if product is in stock and get current price
        Boolean inStock = false;
        BigDecimal currentPrice = null;
        try {
            Product product = productRepository.findById(ing.getProductId()).orElse(null);
            if (product != null) {
                inStock = product.getActive() && product.getStockQuantity() > 0;
                currentPrice = product.getPrice();
            }
        } catch (Exception e) {
            // Product might not exist, that's okay
        }
        
        return RecipeIngredientDto.builder()
                .id(ing.getId())
                .productId(ing.getProductId())
                .productName(ing.getProductName())
                .quantity(ing.getQuantity())
                .unit(ing.getUnit())
                .notes(ing.getNotes())
                .inStock(inStock)
                .currentPrice(currentPrice)
                .build();
    }
    
    // ========== Wishlist Methods ==========
    
    public List<WishlistDto> getUserWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return wishlistItems.stream()
                .map(this::toWishlistDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public WishlistDto addToWishlist(Long userId, Long productId, BigDecimal targetPrice) {
        // Check if already in wishlist
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);
        if (existing.isPresent()) {
            // Update existing wishlist item
            Wishlist wishlist = existing.get();
            if (targetPrice != null) {
                wishlist.setTargetPrice(targetPrice);
            }
            wishlist = wishlistRepository.save(wishlist);
            return toWishlistDto(wishlist);
        }
        
        // Get product to get current price
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Record current price in price history if not exists
        Optional<PriceHistory> latestPrice = priceHistoryRepository.findFirstByProductIdOrderByRecordedAtDesc(productId);
        if (latestPrice.isEmpty() || !latestPrice.get().getPrice().equals(product.getPrice())) {
            PriceHistory priceHistory = PriceHistory.builder()
                    .productId(productId)
                    .price(product.getPrice())
                    .build();
            priceHistoryRepository.save(priceHistory);
        }
        
        // Create new wishlist item
        Wishlist wishlist = Wishlist.builder()
                .userId(userId)
                .productId(productId)
                .notifyOnPriceDrop(true)
                .notifyWhenInStock(true)
                .targetPrice(targetPrice)
                .build();
        
        wishlist = wishlistRepository.save(wishlist);
        return toWishlistDto(wishlist);
    }
    
    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }
    
    @Transactional
    public WishlistDto updateWishlistSettings(Long userId, Long productId, Boolean notifyOnPriceDrop, Boolean notifyWhenInStock, BigDecimal targetPrice) {
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));
        
        if (notifyOnPriceDrop != null) {
            wishlist.setNotifyOnPriceDrop(notifyOnPriceDrop);
        }
        if (notifyWhenInStock != null) {
            wishlist.setNotifyWhenInStock(notifyWhenInStock);
        }
        if (targetPrice != null) {
            wishlist.setTargetPrice(targetPrice);
        }
        
        wishlist = wishlistRepository.save(wishlist);
        return toWishlistDto(wishlist);
    }
    
    public List<PriceHistoryDto> getPriceHistory(Long productId) {
        return priceHistoryRepository.findByProductIdOrderByRecordedAtDesc(productId).stream()
                .map(this::toPriceHistoryDto)
                .collect(Collectors.toList());
    }
    
    private WishlistDto toWishlistDto(Wishlist wishlist) {
        Product product = productRepository.findById(wishlist.getProductId()).orElse(null);
        
        if (product == null) {
            // Product might have been deleted
            return WishlistDto.builder()
                    .id(wishlist.getId())
                    .userId(wishlist.getUserId())
                    .productId(wishlist.getProductId())
                    .notifyOnPriceDrop(wishlist.getNotifyOnPriceDrop())
                    .notifyWhenInStock(wishlist.getNotifyWhenInStock())
                    .targetPrice(wishlist.getTargetPrice())
                    .createdAt(wishlist.getCreatedAt())
                    .updatedAt(wishlist.getUpdatedAt())
                    .inStock(false)
                    .build();
        }
        
        BigDecimal currentPrice = product.getPrice();
        Boolean inStock = product.getActive() && product.getStockQuantity() > 0;
        
        // Get price when added to wishlist (first price history entry after wishlist creation)
        BigDecimal previousPrice = currentPrice;
        Optional<PriceHistory> priceAtWishlistTime = priceHistoryRepository.findByProductIdOrderByRecordedAtDesc(wishlist.getProductId())
                .stream()
                .filter(ph -> ph.getRecordedAt().isBefore(wishlist.getCreatedAt()) || 
                             ph.getRecordedAt().isEqual(wishlist.getCreatedAt()))
                .findFirst();
        if (priceAtWishlistTime.isPresent()) {
            previousPrice = priceAtWishlistTime.get().getPrice();
        }
        
        // Get lowest price since added
        BigDecimal lowestPrice = currentPrice;
        List<PriceHistory> priceHistory = priceHistoryRepository.findByProductIdOrderByRecordedAtDesc(wishlist.getProductId());
        for (PriceHistory ph : priceHistory) {
            if (ph.getRecordedAt().isAfter(wishlist.getCreatedAt()) || 
                ph.getRecordedAt().isEqual(wishlist.getCreatedAt())) {
                if (ph.getPrice().compareTo(lowestPrice) < 0) {
                    lowestPrice = ph.getPrice();
                }
            }
        }
        
        // Check if price dropped
        Boolean priceDropped = currentPrice.compareTo(previousPrice) < 0;
        BigDecimal priceDropAmount = priceDropped ? previousPrice.subtract(currentPrice) : BigDecimal.ZERO;
        
        return WishlistDto.builder()
                .id(wishlist.getId())
                .userId(wishlist.getUserId())
                .productId(wishlist.getProductId())
                .productName(product.getName())
                .productImageUrl(product.getImageUrl())
                .currentPrice(currentPrice)
                .previousPrice(previousPrice)
                .lowestPrice(lowestPrice)
                .inStock(inStock)
                .notifyOnPriceDrop(wishlist.getNotifyOnPriceDrop())
                .notifyWhenInStock(wishlist.getNotifyWhenInStock())
                .targetPrice(wishlist.getTargetPrice())
                .createdAt(wishlist.getCreatedAt())
                .updatedAt(wishlist.getUpdatedAt())
                .priceDropped(priceDropped)
                .priceDropAmount(priceDropAmount)
                .build();
    }
    
    private PriceHistoryDto toPriceHistoryDto(PriceHistory priceHistory) {
        return PriceHistoryDto.builder()
                .id(priceHistory.getId())
                .productId(priceHistory.getProductId())
                .price(priceHistory.getPrice())
                .recordedAt(priceHistory.getRecordedAt())
                .build();
    }
}

