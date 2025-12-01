import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './RecipeDetails.css'

const RecipeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchRecipe()
  }, [id])

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/api/catalog/recipes/${id}`)
      setRecipe(response.data)
    } catch (error) {
      console.error('Error fetching recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const addAllIngredientsToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
      alert('No ingredients to add')
      return
    }

    setAddingToCart(true)
    let addedCount = 0
    let skippedCount = 0

    try {
      for (const ingredient of recipe.ingredients) {
        try {
          // Check if product is in stock
          if (ingredient.inStock === false) {
            skippedCount++
            continue
          }

          // Determine quantity or weight
          const quantityValue = ingredient.quantity ? Number(ingredient.quantity) : 1
          const quantity = Math.ceil(quantityValue)
          const weight = ingredient.unit && (ingredient.unit.toLowerCase().includes('lb') || ingredient.unit.toLowerCase().includes('kg')) 
            ? quantityValue 
            : null

          // Get current product price
          let price = ingredient.currentPrice
          if (!price) {
            try {
              const productResponse = await axios.get(`/api/catalog/products/${ingredient.productId}`)
              price = productResponse.data.price
            } catch (error) {
              console.error(`Error fetching product ${ingredient.productId}:`, error)
              skippedCount++
              continue
            }
          }

          await axios.post(`/api/cart/${user.userId}/items`, null, {
            params: {
              productId: ingredient.productId,
              productName: ingredient.productName,
              price: price,
              quantity: weight ? 1 : quantity,
              weight: weight ? weight.toString() : null
            }
          })
          addedCount++
        } catch (error) {
          console.error(`Error adding ${ingredient.productName} to cart:`, error)
          skippedCount++
        }
      }

      refreshCart()
      
      if (addedCount > 0) {
        setSuccessMessage(
          `${addedCount} ingredient${addedCount > 1 ? 's' : ''} added to cart!` +
          (skippedCount > 0 ? ` (${skippedCount} skipped - out of stock)` : '')
        )
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/cart')
        }, 2000)
      } else {
        alert('No ingredients could be added. They may be out of stock.')
      }
    } catch (error) {
      console.error('Error adding ingredients to cart:', error)
      alert('Failed to add ingredients to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return <div className="container">Loading recipe...</div>
  }

  if (!recipe) {
    return <div className="container">Recipe not found</div>
  }

  const inStockCount = recipe.ingredients?.filter(ing => ing.inStock !== false).length || 0
  const outOfStockCount = recipe.ingredients?.filter(ing => ing.inStock === false).length || 0

  return (
    <div className="container recipe-details">
      <button 
        onClick={() => navigate('/recipes')} 
        className="btn-back"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Recipes
      </button>

      <div className="recipe-details-content">
        <div className="recipe-main">
          {recipe.imageUrl && (
            <div className="recipe-image-large">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=Recipe'
                }}
              />
            </div>
          )}

          <div className="recipe-header-details">
            <h1>{recipe.name}</h1>
            {recipe.description && (
              <p className="recipe-description-large">{recipe.description}</p>
            )}

            <div className="recipe-stats">
              {recipe.cuisineType && (
                <div className="stat-item">
                  <span className="stat-label">Cuisine:</span>
                  <span className="cuisine-badge">{recipe.cuisineType}</span>
                </div>
              )}
              {recipe.cookingTime && (
                <div className="stat-item">
                  <span className="stat-label">Time:</span>
                  <span>⏱️ {recipe.cookingTime} minutes</span>
                </div>
              )}
              {recipe.servings && (
                <div className="stat-item">
                  <span className="stat-label">Serves:</span>
                  <span>👥 {recipe.servings} people</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="stat-item">
                  <span className="stat-label">Difficulty:</span>
                  <span className={`difficulty-badge ${recipe.difficulty.toLowerCase()}`}>
                    {recipe.difficulty}
                  </span>
                </div>
              )}
            </div>

            <div className="recipe-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={addAllIngredientsToCart}
                disabled={addingToCart || !user || inStockCount === 0}
              >
                {addingToCart ? 'Adding to Cart...' : '🛒 Add All Ingredients to Cart'}
              </button>
              {!user && (
                <p className="login-prompt">Please log in to add ingredients to cart</p>
              )}
              {inStockCount > 0 && (
                <p className="stock-info">
                  {inStockCount} ingredient{inStockCount > 1 ? 's' : ''} available
                  {outOfStockCount > 0 && ` (${outOfStockCount} out of stock)`}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="recipe-sections">
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="ingredients-section">
              <h2>📋 Ingredients</h2>
              <div className="ingredients-list">
                {recipe.ingredients.map((ingredient, index) => (
                  <div
                    key={ingredient.id || index}
                    className={`ingredient-item ${ingredient.inStock === false ? 'out-of-stock' : ''}`}
                  >
                    <div className="ingredient-info">
                      <span className="ingredient-name">
                        {ingredient.productName}
                        {ingredient.inStock === false && (
                          <span className="out-of-stock-badge">Out of Stock</span>
                        )}
                      </span>
                      <span className="ingredient-quantity">
                        {ingredient.quantity && `${ingredient.quantity} `}
                        {ingredient.unit && `${ingredient.unit}`}
                        {ingredient.notes && ` (${ingredient.notes})`}
                      </span>
                      {ingredient.currentPrice && (
                        <span className="ingredient-price">
                          ${ingredient.currentPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recipe.instructions && (
            <div className="instructions-section">
              <h2>👨‍🍳 Instructions</h2>
              <div className="instructions-content">
                {recipe.instructions.split('\n').map((step, index) => (
                  <div key={index} className="instruction-step">
                    <span className="step-number">{index + 1}</span>
                    <span className="step-text">{step.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          show={showSuccess}
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default RecipeDetails

