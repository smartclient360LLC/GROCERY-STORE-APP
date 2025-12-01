import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import './RecipeList.css'

const RecipeList = () => {
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState([])
  const [filteredRecipes, setFilteredRecipes] = useState([])
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [])

  useEffect(() => {
    if (selectedCuisine === 'all') {
      setFilteredRecipes(recipes)
    } else {
      setFilteredRecipes(recipes.filter(recipe => recipe.cuisineType === selectedCuisine))
    }
  }, [selectedCuisine, recipes])

  const fetchRecipes = async () => {
    try {
      const response = await apiClient.get('/api/catalog/recipes')
      setRecipes(response.data)
      setFilteredRecipes(response.data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCuisineTypes = () => {
    const cuisines = [...new Set(recipes.map(r => r.cuisineType).filter(Boolean))]
    return cuisines
  }

  if (loading) {
    return <div className="container">Loading recipes...</div>
  }

  return (
    <div className="container recipe-list">
      <div className="recipe-header">
        <h1>🍳 Recipe Collection</h1>
        <p>Browse delicious recipes and add all ingredients to your cart with one click!</p>
      </div>

      {recipes.length > 0 && (
        <div className="cuisine-filters">
          <button
            className={selectedCuisine === 'all' ? 'active' : ''}
            onClick={() => setSelectedCuisine('all')}
          >
            All Recipes
          </button>
          {getCuisineTypes().map(cuisine => (
            <button
              key={cuisine}
              className={selectedCuisine === cuisine ? 'active' : ''}
              onClick={() => setSelectedCuisine(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      )}

      {filteredRecipes.length === 0 ? (
        <div className="no-recipes">
          <p>No recipes found. Check back soon for new recipes!</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className="recipe-card"
              onClick={() => navigate(`/recipes/${recipe.id}`)}
            >
              {recipe.imageUrl && (
                <div className="recipe-image">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300?text=Recipe'
                    }}
                  />
                </div>
              )}
              <div className="recipe-info">
                <h3>{recipe.name}</h3>
                {recipe.description && (
                  <p className="recipe-description">{recipe.description}</p>
                )}
                <div className="recipe-meta">
                  {recipe.cuisineType && (
                    <span className="cuisine-badge">{recipe.cuisineType}</span>
                  )}
                  {recipe.cookingTime && (
                    <span className="meta-item">⏱️ {recipe.cookingTime} min</span>
                  )}
                  {recipe.servings && (
                    <span className="meta-item">👥 {recipe.servings} servings</span>
                  )}
                  {recipe.difficulty && (
                    <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                      {recipe.difficulty}
                    </span>
                  )}
                </div>
                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <p className="ingredient-count">
                    {recipe.ingredients.length} ingredient{recipe.ingredients.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecipeList

