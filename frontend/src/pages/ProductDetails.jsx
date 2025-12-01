import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './ProductDetails.css'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(1.0) // Weight in pounds
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const [substitutions, setSubstitutions] = useState([])
  const [loadingSubstitutions, setLoadingSubstitutions] = useState(false)
  
  // Check if product is sold by weight (meat, fruits, vegetables)
  const isWeightBased = () => {
    if (!product || !product.categoryName) return false
    const category = product.categoryName.toLowerCase().trim()
    return category === 'meat' || category === 'fruits' || category === 'fruits & vegetables' || 
           category === 'vegetables' || category.includes('fruit') || category.includes('vegetable')
  }

  useEffect(() => {
    fetchProduct()
    if (user) {
      checkWishlistStatus()
    }
  }, [id, user])

  useEffect(() => {
    if (product && (!product.active || product.stockQuantity === 0)) {
      fetchSubstitutions()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/api/catalog/products/${id}`)
      // Backend already checks availability
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      // Product not found or not available
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!user) return
    try {
      const response = await apiClient.get(`/api/catalog/wishlist/${user.userId}`)
      const wishlistItem = response.data.find(item => item.productId === parseInt(id))
      if (wishlistItem) {
        setIsInWishlist(true)
        setWishlistId(wishlistItem.id)
      }
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  const fetchSubstitutions = async () => {
    if (!product) return
    setLoadingSubstitutions(true)
    try {
      const response = await apiClient.get(`/api/catalog/products/${product.id}/substitutions?limit=5`)
      setSubstitutions(response.data)
    } catch (error) {
      console.error('Error fetching substitutions:', error)
    } finally {
      setLoadingSubstitutions(false)
    }
  }

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      if (isInWishlist) {
        await apiClient.delete(`/api/catalog/wishlist/${user.userId}/products/${id}`)
        setIsInWishlist(false)
        setWishlistId(null)
        setSuccessMessage('Removed from wishlist')
      } else {
        await apiClient.post(`/api/catalog/wishlist/${user.userId}/products/${id}`)
        setIsInWishlist(true)
        setSuccessMessage('Added to wishlist')
      }
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    }
  }

  const addToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const params = {
        productId: product.id,
        productName: product.name,
        price: product.price
      }
      
      if (isWeightBased()) {
        // For weight-based products, send weight as string
        params.weight = weight.toString()
        params.quantity = 1 // Set quantity to 1 for weight-based items
      } else {
        // For quantity-based products, send quantity
        params.quantity = quantity
      }
      
      await apiClient.post(`/api/cart/${user.userId}/items`, null, { params })
      refreshCart()
      setSuccessMessage(isWeightBased() 
        ? `${parseFloat(weight).toFixed(2)} lbs of ${product?.name} added to cart successfully!`
        : `${quantity} x ${product?.name} added to cart successfully!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-unavailable">
          <h2>Product Not Available</h2>
          <p>This product is currently unavailable or out of stock.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Other Products
          </button>
        </div>
      </div>
    )
  }
  
  const isAvailable = product.active && product.stockQuantity > 0

  return (
    <div className="container product-details">
      <button 
        onClick={() => navigate('/products')} 
        className="btn-back"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Products
      </button>
      <div className="product-details-content">
        <div className="product-image">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400'}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
            }}
          />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          {product.productCode && (
            <p className="product-code">Product Code: <strong>{product.productCode}</strong></p>
          )}
          <p className="category">{product.categoryName}</p>
          <p className="price">${product.price.toFixed(2)} {isWeightBased() ? 'per lb' : ''}</p>
          <p className="description">{product.description}</p>
          <p className="stock">Stock: {product.stockQuantity}</p>
          {isWeightBased() ? (
            <div className="weight-selector">
              <label>Weight (lbs):</label>
              <div className="weight-input-group">
                <button
                  type="button"
                  className="weight-btn"
                  onClick={() => setWeight(Math.max(0.1, (parseFloat(weight) || 0.1) - 0.5))}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val >= 0.1) {
                      setWeight(val)
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value)
                    if (isNaN(val) || val < 0.1) {
                      setWeight(0.1)
                    } else {
                      // Round to 2 decimal places
                      setWeight(Math.round(val * 100) / 100)
                    }
                  }}
                  className="input weight-input"
                />
                <button
                  type="button"
                  className="weight-btn"
                  onClick={() => setWeight((parseFloat(weight) || 0.1) + 0.5)}
                >
                  +
                </button>
              </div>
              <p className="weight-note">Enter weight in pounds (lbs). Use +/- buttons or type directly (e.g., 2.50)</p>
            </div>
          ) : (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input"
              />
            </div>
          )}
          <div className="product-actions">
            {isAvailable ? (
              <button onClick={addToCart} className="btn btn-primary">
                Add to Cart
              </button>
            ) : (
            <div className="unavailable-message">
              <p className="unavailable-text">This product is currently unavailable</p>
              {product.stockQuantity === 0 && (
                <p className="stock-message">Out of Stock</p>
              )}
              {!product.active && (
                <p className="stock-message">Product Inactive</p>
              )}
            </div>
            )}
            {user && (
              <button
                onClick={toggleWishlist}
                className={`btn ${isInWishlist ? 'btn-secondary' : 'btn-outline'}`}
                style={{ marginTop: '0.5rem' }}
              >
                {isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Substitutions Section */}
      {!isAvailable && substitutions.length > 0 && (
        <div className="substitutions-section">
          <h2>💡 Suggested Alternatives</h2>
          <p className="substitutions-intro">This product is currently unavailable. Here are some similar alternatives:</p>
          <div className="substitutions-grid">
            {substitutions.map((sub) => (
              <div key={sub.product.id} className="substitution-card">
                <img
                  src={sub.product.imageUrl || 'https://via.placeholder.com/150'}
                  alt={sub.product.name}
                  onClick={() => navigate(`/products/${sub.product.id}`)}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop'
                  }}
                />
                <div className="substitution-info">
                  <h3 onClick={() => navigate(`/products/${sub.product.id}`)}>
                    {sub.product.name}
                  </h3>
                  <p className="substitution-price">${parseFloat(sub.product.price).toFixed(2)}</p>
                  {sub.priceDifference && parseFloat(sub.priceDifference) !== 0 && (
                    <p className={`price-diff ${parseFloat(sub.priceDifference) < 0 ? 'cheaper' : 'more-expensive'}`}>
                      {parseFloat(sub.priceDifference) < 0 
                        ? `$${Math.abs(parseFloat(sub.priceDifference)).toFixed(2)} cheaper`
                        : `$${parseFloat(sub.priceDifference).toFixed(2)} more`}
                    </p>
                  )}
                  <p className="substitution-reason">{sub.reason}</p>
                  <button
                    onClick={() => navigate(`/products/${sub.product.id}`)}
                    className="btn btn-primary btn-sm"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isAvailable && loadingSubstitutions && (
        <div className="substitutions-section">
          <p>Loading suggestions...</p>
        </div>
      )}
      
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  )
}

export default ProductDetails

