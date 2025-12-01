import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './Home.css'

const Home = () => {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const [frequentlyOrdered, setFrequentlyOrdered] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user && user.userId) {
      fetchFrequentlyOrdered()
    }
  }, [user])

  const fetchFrequentlyOrdered = async () => {
    try {
      const response = await apiClient.get(`/api/orders/user/${user.userId}/frequently-ordered`)
      setFrequentlyOrdered(response.data)
    } catch (error) {
      console.error('Error fetching frequently ordered products:', error)
    }
  }

  const addToCart = async (product) => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const quantity = product.averageQuantity || 1
      const weight = product.averageWeight ? product.averageWeight.toString() : null
      
      await apiClient.post(`/api/cart/${user.userId}/items`, null, {
        params: {
          productId: product.productId,
          productName: product.productName,
          price: product.averagePrice,
          quantity: weight ? 1 : quantity,
          weight: weight
        }
      })
      
      refreshCart()
      setSuccessMessage(`${product.productName} added to cart!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Welcome to India Foods</h1>
          <p>Authentic Indian groceries & fresh meat delivered to your door</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary">
              Shop Now
            </Link>
            <Link to="/recipes" className="btn btn-secondary" style={{ background: 'white', color: '#FF6B35', border: '2px solid #FF6B35' }}>
              🍳 Browse Recipes
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        {user && frequentlyOrdered.length > 0 && (
          <div className="buy-again-section">
            <h2>🛒 Buy Again</h2>
            <p className="section-subtitle">Your frequently ordered items</p>
            <div className="buy-again-grid">
              {frequentlyOrdered.map(product => (
                <div key={product.productId} className="buy-again-card">
                  <div className="buy-again-info">
                    <h3>{product.productName}</h3>
                    <p className="buy-again-stats">
                      Ordered {product.totalTimesOrdered} time{product.totalTimesOrdered > 1 ? 's' : ''}
                      {product.lastOrderedDate && (
                        <span className="last-ordered">Last: {new Date(product.lastOrderedDate).toLocaleDateString()}</span>
                      )}
                    </p>
                    <p className="buy-again-price">${product.averagePrice.toFixed(2)}</p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => addToCart(product)}
                    disabled={loading}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="features">
          <div className="feature">
            <h3>Fresh Products</h3>
            <p>We source the freshest products daily</p>
          </div>
          <div className="feature">
            <h3>Fast Delivery</h3>
            <p>Get your groceries delivered quickly</p>
          </div>
          <div className="feature">
            <h3>Best Prices</h3>
            <p>Competitive prices on all products</p>
          </div>
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

export default Home

