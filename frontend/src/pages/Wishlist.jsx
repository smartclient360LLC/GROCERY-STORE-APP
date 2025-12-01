import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './Wishlist.css'

const Wishlist = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { refreshCart } = useCart()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      navigate('/login')
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      const response = await axios.get(`/api/catalog/wishlist/${user.userId}`)
      setWishlist(response.data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`/api/catalog/wishlist/${user.userId}/products/${productId}`)
      setWishlist(wishlist.filter(item => item.productId !== productId))
      setSuccessMessage('Removed from wishlist')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      alert('Failed to remove from wishlist')
    }
  }

  const addToCart = async (item) => {
    try {
      const params = {
        productId: item.productId,
        productName: item.productName,
        price: item.currentPrice,
        quantity: 1
      }
      
      await axios.post(`/api/cart/${user.userId}/items`, null, { params })
      refreshCart()
      setSuccessMessage(`${item.productName} added to cart!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    }
  }

  const updateNotificationSettings = async (productId, notifyOnPriceDrop, notifyWhenInStock, targetPrice) => {
    try {
      const params = {}
      if (notifyOnPriceDrop !== undefined) params.notifyOnPriceDrop = notifyOnPriceDrop
      if (notifyWhenInStock !== undefined) params.notifyWhenInStock = notifyWhenInStock
      if (targetPrice !== undefined) params.targetPrice = targetPrice
      
      await axios.put(`/api/catalog/wishlist/${user.userId}/products/${productId}`, null, { params })
      fetchWishlist() // Refresh to get updated data
    } catch (error) {
      console.error('Error updating notification settings:', error)
      alert('Failed to update notification settings')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container wishlist-page">
      <h1>My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-item">
              <div className="wishlist-item-image">
                <img
                  src={item.productImageUrl || 'https://via.placeholder.com/200'}
                  alt={item.productName}
                  onClick={() => navigate(`/products/${item.productId}`)}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'
                  }}
                />
                {item.priceDropped && (
                  <div className="price-drop-badge">
                    <span>Price Dropped!</span>
                    <span className="drop-amount">-${parseFloat(item.priceDropAmount).toFixed(2)}</span>
                  </div>
                )}
                {!item.inStock && (
                  <div className="out-of-stock-badge">Out of Stock</div>
                )}
              </div>
              <div className="wishlist-item-info">
                <h3 onClick={() => navigate(`/products/${item.productId}`)}>
                  {item.productName}
                </h3>
                <div className="price-info">
                  <span className="current-price">${parseFloat(item.currentPrice).toFixed(2)}</span>
                  {item.previousPrice && parseFloat(item.previousPrice) > parseFloat(item.currentPrice) && (
                    <span className="previous-price">${parseFloat(item.previousPrice).toFixed(2)}</span>
                  )}
                </div>
                {item.lowestPrice && parseFloat(item.lowestPrice) < parseFloat(item.currentPrice) && (
                  <p className="lowest-price">Lowest: ${parseFloat(item.lowestPrice).toFixed(2)}</p>
                )}
                <div className="wishlist-actions">
                  {item.inStock ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-primary btn-sm"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button disabled className="btn btn-secondary btn-sm">
                      Out of Stock
                    </button>
                  )}
                  <button
                    onClick={() => removeFromWishlist(item.productId)}
                    className="btn btn-danger btn-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="notification-settings">
                  <label>
                    <input
                      type="checkbox"
                      checked={item.notifyOnPriceDrop}
                      onChange={(e) => updateNotificationSettings(
                        item.productId,
                        e.target.checked,
                        undefined,
                        undefined
                      )}
                    />
                    Notify on price drop
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={item.notifyWhenInStock}
                      onChange={(e) => updateNotificationSettings(
                        item.productId,
                        undefined,
                        e.target.checked,
                        undefined
                      )}
                    />
                    Notify when in stock
                  </label>
                  {item.targetPrice && (
                    <p className="target-price">Target: ${item.targetPrice.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
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

export default Wishlist

