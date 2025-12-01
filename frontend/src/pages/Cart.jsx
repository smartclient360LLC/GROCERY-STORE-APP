import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Cart.css'

const MEAT_MIN_ORDER = 50
const GROCERY_MIN_ORDER = 100

const Cart = () => {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState({})
  const [meatTotal, setMeatTotal] = useState(0)
  const [groceryTotal, setGroceryTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [weightInputs, setWeightInputs] = useState({}) // Local state for weight inputs
  const [substitutions, setSubstitutions] = useState({}) // Map of productId -> substitutions array

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      navigate('/login')
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const response = await axios.get(`/api/cart/${user.userId}`)
      setCart(response.data)
      
      // Fetch product details to get categories
      const productDetails = {}
      let meatTotal = 0
      let groceryTotal = 0
      
      for (const item of response.data.items) {
        try {
          const productResponse = await axios.get(`/api/catalog/products/${item.productId}`)
          const product = productResponse.data
          productDetails[item.productId] = product
          
          // Calculate item total: use weight if available, otherwise use quantity
          const itemTotal = item.weight && item.weight > 0 
            ? item.price * item.weight 
            : item.price * item.quantity
          
          if (product.categoryName && product.categoryName.toLowerCase().trim() === 'meat') {
            meatTotal += itemTotal
          } else {
            groceryTotal += itemTotal
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error)
        }
      }
      
      setProducts(productDetails)
      setMeatTotal(meatTotal)
      setGroceryTotal(groceryTotal)
      
      // Initialize weight inputs from cart items
      const weightInputsState = {}
      response.data.items.forEach(item => {
        if (item.weight) {
          const weightVal = typeof item.weight === 'number' ? item.weight : parseFloat(item.weight)
          weightInputsState[item.id] = isNaN(weightVal) ? 1.0 : weightVal
        }
      })
      setWeightInputs(weightInputsState)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      await axios.put(`/api/cart/${user.userId}/items/${itemId}`, null, {
        params: { quantity }
      })
      await fetchCart()
      refreshCart()
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }
  
  const updateWeight = async (itemId, weight) => {
    try {
      // Ensure weight is a valid number and convert to string
      const weightValue = typeof weight === 'number' ? weight : parseFloat(weight)
      if (isNaN(weightValue) || weightValue < 0.1) {
        console.error('Invalid weight value:', weight)
        return
      }
      
      // Round to 2 decimal places and convert to string
      const roundedWeight = Math.round(weightValue * 100) / 100
      const weightString = roundedWeight.toFixed(2)
      
      console.log('Updating weight:', { itemId, weight: weightString, userId: user.userId })
      
      // Send weight as query parameter in URL (encodeURIComponent handles special characters)
      const url = `/api/cart/${user.userId}/items/${itemId}?weight=${encodeURIComponent(weightString)}`
      console.log('Request URL:', url)
      
      // Try with query parameter first
      const response = await axios.put(url, null, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      // Update local weight input state with the response
      if (response.data && response.data.weight) {
        const updatedWeight = typeof response.data.weight === 'number' 
          ? response.data.weight 
          : parseFloat(response.data.weight)
        setWeightInputs(prev => ({
          ...prev,
          [itemId]: updatedWeight
        }))
      }
      
      await fetchCart()
      refreshCart()
    } catch (error) {
      console.error('Error updating weight:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Revert local state on error
      const item = cart?.items?.find(i => i.id === itemId)
      if (item && item.weight) {
        const originalWeight = typeof item.weight === 'number' ? item.weight : parseFloat(item.weight)
        setWeightInputs(prev => ({
          ...prev,
          [itemId]: originalWeight
        }))
      }
      
      alert(`Failed to update weight: ${error.response?.data?.message || error.message || 'Unknown error'}`)
    }
  }
  
  const isWeightBased = (product) => {
    if (!product || !product.categoryName) return false
    const category = product.categoryName.toLowerCase().trim()
    return category === 'meat' || category === 'fruits' || category === 'fruits & vegetables' || 
           category === 'vegetables' || category.includes('fruit') || category.includes('vegetable')
  }

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/cart/${user.userId}/items/${itemId}`)
      await fetchCart()
      refreshCart()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }
  
  const getMinOrderMessage = () => {
    const messages = []
    if (meatTotal > 0 && meatTotal < MEAT_MIN_ORDER) {
      messages.push(`Meat: $${(MEAT_MIN_ORDER - meatTotal).toFixed(2)} more needed (min $${MEAT_MIN_ORDER})`)
    }
    if (groceryTotal > 0 && groceryTotal < GROCERY_MIN_ORDER) {
      messages.push(`Grocery: $${(GROCERY_MIN_ORDER - groceryTotal).toFixed(2)} more needed (min $${GROCERY_MIN_ORDER})`)
    }
    return messages
  }
  
  const canCheckout = () => {
    const meatOk = meatTotal === 0 || meatTotal >= MEAT_MIN_ORDER
    const groceryOk = groceryTotal === 0 || groceryTotal >= GROCERY_MIN_ORDER
    return meatOk && groceryOk
  }

  const proceedToCheckout = () => {
    if (cart && cart.items.length > 0) {
      navigate('/checkout')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container cart">
        <h1>Shopping Cart</h1>
        <p>Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="container cart">
      <button 
        onClick={() => navigate('/products')} 
        className="btn-back"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Products
      </button>
      <h1>Shopping Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map(item => {
            const product = products[item.productId]
            const isMeat = product?.categoryName?.toLowerCase().trim() === 'meat'
            const weightBased = isWeightBased(product)
            const isOutOfStock = product && (!product.active || product.stockQuantity === 0)
            const itemSubstitutions = substitutions[item.productId] || []
            return (
              <div key={item.id} className={`cart-item ${isOutOfStock ? 'out-of-stock' : ''}`}>
                <div className="cart-item-main">
                  <div className="item-info">
                    <h3>
                      {item.productName}
                      {isMeat && <span className="category-badge meat">Meat</span>}
                      {isOutOfStock && <span className="out-of-stock-badge">Out of Stock</span>}
                    </h3>
                    <p>${item.price.toFixed(2)} {weightBased ? 'per lb' : 'each'}</p>
                  </div>
                  <div className="item-controls">
                  {weightBased ? (
                    <div className="weight-control-group">
                      <label>Weight (lbs):</label>
                      <div className="weight-input-group">
                        <button
                          type="button"
                          className="weight-btn"
                          onClick={() => {
                            // Get current weight from local state or item
                            let currentWeight = weightInputs[item.id]
                            if (currentWeight === undefined) {
                              currentWeight = item.weight 
                                ? (typeof item.weight === 'number' ? item.weight : parseFloat(item.weight)) 
                                : 1.0
                            }
                            const newWeight = Math.max(0.1, currentWeight - 0.5)
                            setWeightInputs(prev => ({ ...prev, [item.id]: newWeight }))
                            updateWeight(item.id, newWeight)
                          }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={weightInputs[item.id] !== undefined 
                            ? weightInputs[item.id] 
                            : (item.weight ? (typeof item.weight === 'number' ? item.weight : parseFloat(item.weight)) : 1.0)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value)
                            if (!isNaN(val) && val >= 0.1) {
                              // Update local state immediately for responsive UI
                              setWeightInputs(prev => ({
                                ...prev,
                                [item.id]: val
                              }))
                            }
                          }}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value)
                            if (isNaN(val) || val < 0.1) {
                              setWeightInputs(prev => ({ ...prev, [item.id]: 0.1 }))
                              updateWeight(item.id, 0.1)
                            } else {
                              // Round to 2 decimal places
                              const rounded = Math.round(val * 100) / 100
                              setWeightInputs(prev => ({ ...prev, [item.id]: rounded }))
                              updateWeight(item.id, rounded)
                            }
                          }}
                          className="input weight-input"
                        />
                        <button
                          type="button"
                          className="weight-btn"
                          onClick={() => {
                            // Get current weight from local state or item
                            let currentWeight = weightInputs[item.id]
                            if (currentWeight === undefined) {
                              currentWeight = item.weight 
                                ? (typeof item.weight === 'number' ? item.weight : parseFloat(item.weight)) 
                                : 1.0
                            }
                            const newWeight = currentWeight + 0.5
                            setWeightInputs(prev => ({ ...prev, [item.id]: newWeight }))
                            updateWeight(item.id, newWeight)
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="input"
                    />
                  )}
                  <p className="subtotal">${item.subtotal.toFixed(2)}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                  </div>
                </div>
                {isOutOfStock && itemSubstitutions.length > 0 && (
                  <div className="cart-item-substitutions">
                    <p className="substitutions-label">💡 Suggested alternatives:</p>
                    <div className="substitutions-list">
                      {itemSubstitutions.map((sub) => (
                        <div key={sub.product.id} className="substitution-mini-card">
                          <img
                            src={sub.product.imageUrl || 'https://via.placeholder.com/60'}
                            alt={sub.product.name}
                            onClick={() => navigate(`/products/${sub.product.id}`)}
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop'
                            }}
                          />
                          <div className="substitution-mini-info">
                            <span className="substitution-mini-name" onClick={() => navigate(`/products/${sub.product.id}`)}>
                              {sub.product.name}
                            </span>
                            <span className="substitution-mini-price">${parseFloat(sub.product.price).toFixed(2)}</span>
                          </div>
                          <button
                            onClick={() => navigate(`/products/${sub.product.id}`)}
                            className="btn btn-primary btn-xs"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <p>Items: {cart.itemCount}</p>
          
          {meatTotal > 0 && (
            <div className="summary-category">
              <span>Meat Subtotal</span>
              <span className={meatTotal >= MEAT_MIN_ORDER ? 'met' : 'not-met'}>
                ${meatTotal.toFixed(2)} {meatTotal >= MEAT_MIN_ORDER ? '✓' : `(min $${MEAT_MIN_ORDER})`}
              </span>
            </div>
          )}
          
          {groceryTotal > 0 && (
            <div className="summary-category">
              <span>Grocery Subtotal</span>
              <span className={groceryTotal >= GROCERY_MIN_ORDER ? 'met' : 'not-met'}>
                ${groceryTotal.toFixed(2)} {groceryTotal >= GROCERY_MIN_ORDER ? '✓' : `(min $${GROCERY_MIN_ORDER})`}
              </span>
            </div>
          )}
          
          {!canCheckout() && (
            <div className="min-order-warning">
              <strong>Minimum Order Requirements:</strong>
              <ul>
                {getMinOrderMessage().map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="total">Total: ${cart.total.toFixed(2)}</p>
          <button 
            onClick={proceedToCheckout} 
            className="btn btn-primary"
            disabled={!canCheckout()}
          >
            {canCheckout() ? 'Proceed to Checkout' : 'Add More Items to Checkout'}
          </button>
          {!canCheckout() && (
            <p className="checkout-note">Please meet minimum order requirements to proceed</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Cart

