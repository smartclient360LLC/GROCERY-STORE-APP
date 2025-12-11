import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import apiClient from '../config/axios'
import { useAuth } from '../context/AuthContext'
import SuccessModal from '../components/SuccessModal'
import './OrderReceipt.css'

const OrderReceipt = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      // If no orderId, try to get the latest order
      fetchLatestOrder()
    }
    
    // Show success modal on mount if coming from checkout
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      // Keep success modal visible longer for payment confirmation
      setTimeout(() => setShowSuccess(false), 4000)
    }
  }, [orderId, searchParams])

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await apiClient.get(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setOrder(response.data)
    } catch (error) {
      console.error('Error fetching order details:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestOrder = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await apiClient.get(`/api/orders/user/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.data && response.data.length > 0) {
        // Get the most recent order
        const latestOrder = response.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0]
        setOrder(latestOrder)
      }
    } catch (error) {
      console.error('Error fetching latest order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <div className="container">Loading receipt...</div>
  }

  if (!order) {
    return (
      <div className="container">
        <p>Order not found</p>
        <button onClick={() => navigate('/orders')} className="btn btn-primary">
          View Order History
        </button>
      </div>
    )
  }

  return (
    <div className="container order-receipt">
      <div className="receipt-actions">
        <button onClick={() => navigate('/orders')} className="btn btn-secondary">
          ← Back to Orders
        </button>
        <div className="print-actions">
          {showSuccess && (
            <button 
              onClick={handlePrint} 
              className="btn btn-primary print-button-large"
              style={{ marginRight: '1rem' }}
            >
              🖨️ Print Receipt Now
            </button>
          )}
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Print Receipt
          </button>
        </div>
      </div>

      <div className="printable-receipt">
        <div className="receipt-header">
          <h1>India Foods</h1>
          <p className="receipt-subtitle">Order Confirmation & Receipt</p>
        </div>

        <div className="receipt-info">
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
              <strong>Payment Status:</strong> 
              <span className="payment-status paid">✓ Paid</span>
            </div>
            <div className="info-item">
              <strong>Subtotal:</strong> ${(order.subtotal || order.totalAmount).toFixed(2)}
            </div>
            {order.taxAmount && order.taxAmount > 0 && (
              <div className="info-item">
                <strong>Tax (6.1%):</strong> ${order.taxAmount.toFixed(2)}
              </div>
            )}
            {order.deliveryFee && order.deliveryFee > 0 && (
              <div className="info-item">
                <strong>Delivery Fee:</strong> ${order.deliveryFee.toFixed(2)}
              </div>
            )}
            {order.deliveryFee === 0 && (order.subtotal || order.totalAmount) + (order.taxAmount || 0) >= 100 && (
              <div className="info-item">
                <strong>Delivery:</strong> <span className="free-delivery-badge">FREE</span>
              </div>
            )}
            <div className="info-item">
              <strong>Total Amount:</strong> 
              <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="receipt-section">
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

        <div className="receipt-section">
          <h2>Order Items</h2>
          <table className="receipt-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => {
                const weightBased = item.weight && item.weight > 0
                return (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{weightBased ? `${item.weight} lbs` : item.quantity}</td>
                    <td>${item.price.toFixed(2)} {weightBased ? 'per lb' : 'each'}</td>
                    <td>${item.subtotal.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="total-label"><strong>Subtotal:</strong></td>
                <td className="total-value"><strong>${(order.subtotal || order.totalAmount).toFixed(2)}</strong></td>
              </tr>
              {order.taxAmount && order.taxAmount > 0 && (
                <tr>
                  <td colSpan="3" className="total-label"><strong>Tax (6.1%):</strong></td>
                  <td className="total-value"><strong>${order.taxAmount.toFixed(2)}</strong></td>
                </tr>
              )}
              {order.deliveryFee && order.deliveryFee > 0 && (
                <tr>
                  <td colSpan="3" className="total-label"><strong>Delivery Fee:</strong></td>
                  <td className="total-value"><strong>${order.deliveryFee.toFixed(2)}</strong></td>
                </tr>
              )}
              {order.deliveryFee === 0 && (order.subtotal || order.totalAmount) + (order.taxAmount || 0) >= 100 && (
                <tr>
                  <td colSpan="3" className="total-label"><strong>Delivery:</strong></td>
                  <td className="total-value"><strong className="free-delivery-badge">FREE</strong></td>
                </tr>
              )}
              <tr>
                <td colSpan="3" className="total-label"><strong>Total:</strong></td>
                <td className="total-value"><strong>${order.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {order.carbonFootprintKg && (
          <div className="receipt-section carbon-footprint-section">
            <h2>🌍 Environmental Impact</h2>
            <div className="carbon-info">
              <div className="carbon-main">
                <div className="carbon-value">
                  <span className="carbon-number">{order.carbonFootprintKg.toFixed(2)}</span>
                  <span className="carbon-unit">kg CO₂</span>
                </div>
                <p className="carbon-equivalent">
                  ≈ {(order.carbonFootprintKg * 2.5).toFixed(1)} miles driven in a car
                </p>
              </div>
              {order.deliveryDistanceKm && (
                <div className="carbon-details">
                  <p><strong>Delivery Distance:</strong> {order.deliveryDistanceKm.toFixed(1)} km</p>
                </div>
              )}
            </div>
            <p className="carbon-note">
              💡 Tip: Choose more plant-based products to reduce your carbon footprint!
            </p>
          </div>
        )}

        <div className="receipt-footer">
          <p className="thank-you">Thank you for shopping with India Foods!</p>
          <p className="receipt-note">
            {order.status === 'PENDING' 
              ? 'Your order is pending confirmation. We will notify you once your order is confirmed and ready for preparation.'
              : 'Your order has been confirmed and will be prepared for delivery/pickup at the selected location.'}
          </p>
          <p className="receipt-note">
            Order Number: <strong>{order.orderNumber}</strong>
          </p>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal 
          show={showSuccess}
          message="Payment successful! Your order has been received and is pending confirmation. You will be notified once it's confirmed." 
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default OrderReceipt

