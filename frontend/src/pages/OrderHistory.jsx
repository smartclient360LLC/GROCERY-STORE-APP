import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './OrderHistory.css'

const OrderHistory = () => {
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get(`/api/orders/user/${user.userId}`)
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const reorderItems = async (orderId) => {
    if (!user) return
    
    setReordering(true)
    try {
      // Get order items
      const response = await apiClient.get(`/api/orders/${orderId}/reorder-items`, {
        params: { userId: user.userId }
      })
      const items = response.data
      
      // Add each item to cart
      let addedCount = 0
      for (const item of items) {
        try {
          const quantity = item.quantity || 1
          const weight = item.weight ? item.weight.toString() : null
          
          await apiClient.post(`/api/cart/${user.userId}/items`, null, {
            params: {
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: weight ? 1 : quantity,
              weight: weight
            }
          })
          addedCount++
        } catch (error) {
          console.error(`Error adding ${item.productName} to cart:`, error)
        }
      }
      
      refreshCart()
      setSuccessMessage(`${addedCount} item${addedCount > 1 ? 's' : ''} added to cart!`)
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/cart')
      }, 2000)
    } catch (error) {
      console.error('Error reordering:', error)
      alert('Failed to reorder items. Please try again.')
    } finally {
      setReordering(false)
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container order-history">
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div 
              key={order.id} 
              className="order-card"
              onClick={() => navigate(`/orders/receipt?orderId=${order.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="order-header">
                <h3>Order #{order.orderNumber}</h3>
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-items">
                {order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <p className="order-total">Total: ${order.totalAmount.toFixed(2)}</p>
                <p className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="order-actions" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      reorderItems(order.id)
                    }}
                    disabled={reordering}
                  >
                    {reordering ? 'Adding...' : '🛒 Reorder'}
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/orders/receipt?orderId=${order.id}`)
                    }}
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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

export default OrderHistory

