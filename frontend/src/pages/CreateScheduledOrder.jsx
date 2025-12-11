import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import SuccessModal from '../components/SuccessModal'
import './CreateScheduledOrder.css'

const CreateScheduledOrder = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    orderName: '',
    orderType: 'ONE_TIME',
    recurrenceType: '',
    scheduledDate: '',
    scheduledTime: '',
    deliveryDate: '',
    deliveryTime: '',
    endDate: '',
    maxOccurrences: '',
    notes: '',
    deliveryPoint: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [user])

  const fetchCart = async () => {
    try {
      const response = await axios.get(`/api/cart/${user.userId}`)
      setCart(response.data)
      
      // Pre-fill delivery point if available
      if (response.data.deliveryPoint) {
        setFormData(prev => ({ ...prev, deliveryPoint: response.data.deliveryPoint }))
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      alert('Failed to load cart. Please add items to your cart first.')
      navigate('/cart')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-set delivery date to scheduled date if not set
    if (name === 'scheduledDate' && !formData.deliveryDate) {
      setFormData(prev => ({ ...prev, deliveryDate: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!cart || !cart.items || cart.items.length === 0) {
      alert('Your cart is empty. Please add items before scheduling an order.')
      return
    }

    if (!formData.orderName.trim()) {
      alert('Please enter an order name')
      return
    }

    if (!formData.scheduledDate) {
      alert('Please select a scheduled date')
      return
    }

    if (formData.orderType === 'RECURRING' && !formData.recurrenceType) {
      alert('Please select a recurrence type for recurring orders')
      return
    }

    // Validate scheduled date is not in the past and not more than one month ahead
    const scheduledDate = new Date(formData.scheduledDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 1) // One month from today
    maxDate.setHours(23, 59, 59, 999)
    
    if (scheduledDate < today) {
      alert('Scheduled date cannot be in the past')
      return
    }
    
    if (scheduledDate > maxDate) {
      alert('Scheduled date cannot be more than one month in the future')
      return
    }
    
    // Validate end date if recurring order
    if (formData.orderType === 'RECURRING' && formData.endDate) {
      const endDate = new Date(formData.endDate)
      if (endDate > maxDate) {
        alert('End date cannot be more than one month in the future')
        return
      }
    }

    setSubmitting(true)

    try {
      // Convert cart items to the format expected by the API
      const cartItems = cart.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: parseFloat(item.price),
        quantity: item.quantity,
        weight: item.weight ? parseFloat(item.weight) : null
      }))

      // Prepare shipping address
      const shippingAddress = {
        street: cart.shippingAddress?.street || '',
        city: cart.shippingAddress?.city || '',
        state: cart.shippingAddress?.state || 'UT',
        zipCode: cart.shippingAddress?.zipCode || '',
        country: cart.shippingAddress?.country || 'USA',
        deliveryPoint: formData.deliveryPoint || cart.deliveryPoint || ''
      }

      const requestData = {
        orderName: formData.orderName,
        orderType: formData.orderType,
        recurrenceType: formData.recurrenceType || null,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime || null,
        deliveryDate: formData.deliveryDate || formData.scheduledDate,
        deliveryTime: formData.deliveryTime || null,
        endDate: formData.endDate || null,
        maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences) : null,
        items: cartItems,
        shippingAddress: shippingAddress,
        deliveryPoint: formData.deliveryPoint || cart.deliveryPoint || '',
        notes: formData.notes || null
      }

      const response = await axios.post(
        `/api/orders/scheduled?userId=${user.userId}`,
        requestData
      )

      setSuccessMessage(`Order "${requestData.orderName}" scheduled successfully!`)
      setShowSuccess(true)
      
      // Navigate after showing success message
      setTimeout(() => {
        navigate('/scheduled-orders')
      }, 2000)
    } catch (error) {
      console.error('Error creating scheduled order:', error)
      const errorMessage = error.response?.data?.message || 'Failed to create scheduled order'
      alert(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 1)
    return maxDate.toISOString().split('T')[0]
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container">
        <h1>Schedule Order</h1>
        <p>Your cart is empty. Please add items to your cart first.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    )
  }

  return (
    <div className="container create-scheduled-order-page">
      <h1>📅 Schedule Order</h1>
      
      <div className="cart-summary">
        <h3>Cart Summary</h3>
        <p>{cart.items.length} item(s) in cart</p>
        <div className="cart-items-preview">
          {cart.items.slice(0, 5).map((item, index) => (
            <div key={index} className="cart-item-preview">
              <span>{item.productName}</span>
              <span>
                {item.weight ? `${parseFloat(item.weight).toFixed(2)} lbs` : `${item.quantity}x`}
              </span>
            </div>
          ))}
          {cart.items.length > 5 && (
            <div className="more-items">+ {cart.items.length - 5} more {cart.items.length - 5 === 1 ? 'item' : 'items'}</div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="scheduled-order-form">
        <div className="form-group">
          <label htmlFor="orderName">Order Name *</label>
          <input
            type="text"
            id="orderName"
            name="orderName"
            value={formData.orderName}
            onChange={handleChange}
            placeholder="e.g., Weekly Groceries, Party Order, Monthly Stock"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="orderType">Order Type *</label>
          <select
            id="orderType"
            name="orderType"
            value={formData.orderType}
            onChange={handleChange}
            required
          >
            <option value="ONE_TIME">One-Time Order</option>
            <option value="RECURRING">Recurring Order</option>
          </select>
        </div>

        {formData.orderType === 'RECURRING' && (
          <>
            <div className="form-group">
              <label htmlFor="recurrenceType">Recurrence Type *</label>
              <select
                id="recurrenceType"
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleChange}
                required
              >
                <option value="">Select recurrence</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="endDate">End Date (Optional)</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.scheduledDate || getMinDate()}
                  max={getMaxDate()}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxOccurrences">Max Occurrences (Optional)</label>
                <input
                  type="number"
                  id="maxOccurrences"
                  name="maxOccurrences"
                  value={formData.maxOccurrences}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g., 12"
                />
              </div>
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="scheduledDate">Scheduled Date *</label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="scheduledTime">Scheduled Time (Optional)</label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date *</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              min={formData.scheduledDate || getMinDate()}
              max={getMaxDate()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deliveryTime">Delivery Time (Optional)</label>
            <input
              type="time"
              id="deliveryTime"
              name="deliveryTime"
              value={formData.deliveryTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deliveryPoint">Delivery Point</label>
          <select
            id="deliveryPoint"
            name="deliveryPoint"
            value={formData.deliveryPoint}
            onChange={handleChange}
          >
            <option value="">Select delivery point</option>
            <option value="Lehi">Lehi</option>
            <option value="Herriman">Herriman</option>
            <option value="Saratoga Springs">Saratoga Springs</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Add any special instructions or notes for this order..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/scheduled-orders')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Scheduling...' : 'Schedule Order'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <SuccessModal
          show={showSuccess}
          message={successMessage}
          onClose={() => {
            setShowSuccess(false)
            navigate('/scheduled-orders')
          }}
        />
      )}
    </div>
  )
}

export default CreateScheduledOrder

