import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './AdminOrderDetails.css'

const AdminOrderDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setOrder(response.data)
      
      // Fetch customer info if userId is available
      if (response.data.userId) {
        try {
          const userResponse = await axios.get(`/api/auth/users/${response.data.userId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setCustomerInfo(userResponse.data)
        } catch (error) {
          console.error('Error fetching customer info:', error)
          // Continue without customer info - not critical
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const updateOrderStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(`/api/orders/${id}/status`, null, {
        params: { status: newStatus },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      fetchOrderDetails()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!order) {
    return <div className="container">Order not found</div>
  }

  return (
    <div className="container admin-order-details">
      <div className="order-actions">
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          ← Back to Orders
        </button>
        <button onClick={handlePrint} className="btn btn-primary">
          🖨️ Print Order
        </button>
      </div>

      <div className="printable-order">
        <div className="order-header-print">
          <h1>India Foods</h1>
          <p>Order Details</p>
        </div>

        <div className="order-info-section">
          <div className="info-row">
            <div className="info-item">
              <strong>Order Number:</strong> {order.orderNumber}
            </div>
            <div className="info-item">
              <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="info-row">
            <div className="info-item">
              <strong>Status:</strong> 
              <span className={`status-badge status-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>
            <div className="info-item">
              <strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}
            </div>
          </div>
          <div className="info-row">
            <div className="info-item">
              <strong>Order Type:</strong> 
              <span className={`order-type-badge ${order.isPosOrder ? 'pos' : 'online'}`}>
                {order.isPosOrder ? 'POS Order' : 'Online Order'}
              </span>
            </div>
            <div className="info-item">
              <strong>Total Amount:</strong> <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="customer-section">
          <h2>Customer Information</h2>
          {customerInfo ? (
            <div className="customer-details">
              <p><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
              <p><strong>Email:</strong> {customerInfo.email}</p>
              <p><strong>Customer ID:</strong> {order.userId}</p>
            </div>
          ) : (
            <div className="customer-details">
              <p><strong>Customer ID:</strong> {order.userId}</p>
            </div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="shipping-section">
            <h2>Delivery Information</h2>
            {order.shippingAddress.deliveryPoint && (
              <div className="delivery-point-highlight">
                <strong>📍 Delivery Point:</strong> {order.shippingAddress.deliveryPoint}
              </div>
            )}
            <div className="shipping-details">
              <p><strong>Address:</strong></p>
              <p>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>
          </div>
        )}

        <div className="items-section">
          <h2>Order Items</h2>
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label"><strong>Total:</strong></td>
                <td className="total-value"><strong>${order.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="order-notes">
          <p><strong>Notes:</strong> Please prepare this order for pickup/delivery at the selected location.</p>
        </div>
      </div>

      <div className="status-update-section">
        <h3>Update Order Status</h3>
        <div className="status-buttons">
          <button 
            onClick={() => updateOrderStatus('CONFIRMED')}
            className="btn btn-secondary"
            disabled={order.status === 'CONFIRMED'}
          >
            Confirm
          </button>
          <button 
            onClick={() => updateOrderStatus('PROCESSING')}
            className="btn btn-secondary"
            disabled={order.status === 'PROCESSING'}
          >
            Processing
          </button>
          <button 
            onClick={() => updateOrderStatus('SHIPPED')}
            className="btn btn-secondary"
            disabled={order.status === 'SHIPPED'}
          >
            Shipped
          </button>
          <button 
            onClick={() => updateOrderStatus('DELIVERED')}
            className="btn btn-primary"
            disabled={order.status === 'DELIVERED'}
          >
            Delivered
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetails

