import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
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
      console.log('Fetching recipes from API...')
      const response = await axios.get('/api/catalog/recipes')
      console.log('Recipes response:', response.data)
      if (response.data && Array.isArray(response.data)) {
        setRecipes(response.data)
        setFilteredRecipes(response.data)
        console.log(`Loaded ${response.data.length} recipes`)
      } else {
        console.warn('Unexpected response format:', response.data)
        setRecipes([])
        setFilteredRecipes([])
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      console.error('Error details:', error.response?.data || error.message)
      setRecipes([])
      setFilteredRecipes([])
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
              <div className="recipe-image">
                <img
                  src={recipe.imageUrl || 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&h=300&fit=crop'}
                  alt={recipe.name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ERecipe%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
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

