import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './PosCounter.css'

const PosCounter = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/catalog/products')
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id)
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1
      }])
    }
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.productId !== productId))
    } else {
      setCart(cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      ))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId))
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!')
      return
    }
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    setProcessing(true)
    try {
      const response = await axios.post('/api/orders/pos', {
        userId: user.userId,
        items: cart,
        paymentMethod: paymentMethod,
        isPosOrder: true
      })

      alert(`Order created! Order Number: ${response.data.orderNumber}`)
      setCart([])
      setShowPaymentModal(false)
      setPaymentMethod('CASH')
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to process payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.active
  )

  return (
    <div className="pos-container">
      <div className="pos-header">
        <h1>Cash Counter / POS</h1>
        <div className="pos-user">Cashier: {user?.firstName} {user?.lastName}</div>
      </div>

      <div className="pos-content">
        <div className="pos-products">
          <div className="pos-search">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card-pos"
                onClick={() => addToCart(product)}
              >
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/100'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100'
                  }}
                />
                <div className="product-info-pos">
                  <h4>{product.name}</h4>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <p className="stock">Stock: {product.stockQuantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-cart">
          <h2>Cart</h2>
          <div className="cart-items">
            {cart.length === 0 ? (
              <p className="empty-cart">Cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.productId} className="cart-item">
                  <div className="cart-item-info">
                    <h4>{item.productName}</h4>
                    <p>${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="btn-quantity"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="btn-quantity"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="btn-remove"
                    >
                      ×
                    </button>
                  </div>
                  <div className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="cart-footer">
            <div className="cart-total">
              <h3>Total: ${getTotal().toFixed(2)}</h3>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-checkout"
              disabled={cart.length === 0}
            >
              Process Payment
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="payment-modal">
          <div className="modal-content">
            <h2>Select Payment Method</h2>
            <div className="payment-methods">
              <button
                className={paymentMethod === 'CASH' ? 'active' : ''}
                onClick={() => setPaymentMethod('CASH')}
              >
                💵 Cash
              </button>
              <button
                className={paymentMethod === 'CREDIT_CARD' ? 'active' : ''}
                onClick={() => setPaymentMethod('CREDIT_CARD')}
              >
                💳 Credit Card
              </button>
              <button
                className={paymentMethod === 'DEBIT_CARD' ? 'active' : ''}
                onClick={() => setPaymentMethod('DEBIT_CARD')}
              >
                💳 Debit Card
              </button>
              <button
                className={paymentMethod === 'QR_CODE' ? 'active' : ''}
                onClick={() => setPaymentMethod('QR_CODE')}
              >
                📱 QR Code
              </button>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="btn-confirm"
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PosCounter

