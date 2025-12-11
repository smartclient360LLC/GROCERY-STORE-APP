import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './ScheduledOrders.css'

const ScheduledOrders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scheduledOrders, setScheduledOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'active', 'completed', 'cancelled'

  useEffect(() => {
    if (user) {
      fetchScheduledOrders()
    } else {
      navigate('/login')
    }
  }, [user, filter])

  const fetchScheduledOrders = async () => {
    try {
      let url = `/api/orders/scheduled/user/${user.userId}`
      if (filter !== 'all') {
        url = `/api/orders/scheduled/user/${user.userId}/status/${filter.toUpperCase()}`
      }
      const response = await axios.get(url)
      setScheduledOrders(response.data)
    } catch (error) {
      console.error('Error fetching scheduled orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled order?')) return
    
    try {
      await axios.put(`/api/orders/scheduled/${id}/cancel?userId=${user.userId}`)
      fetchScheduledOrders()
    } catch (error) {
      console.error('Error cancelling scheduled order:', error)
      alert('Failed to cancel scheduled order')
    }
  }

  const handlePause = async (id) => {
    try {
      await axios.put(`/api/orders/scheduled/${id}/pause?userId=${user.userId}`)
      fetchScheduledOrders()
    } catch (error) {
      console.error('Error pausing scheduled order:', error)
      alert('Failed to pause scheduled order')
    }
  }

  const handleResume = async (id) => {
    try {
      await axios.put(`/api/orders/scheduled/${id}/resume?userId=${user.userId}`)
      fetchScheduledOrders()
    } catch (error) {
      console.error('Error resuming scheduled order:', error)
      alert('Failed to resume scheduled order')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled order?')) return
    
    try {
      await axios.delete(`/api/orders/scheduled/${id}?userId=${user.userId}`)
      fetchScheduledOrders()
    } catch (error) {
      console.error('Error deleting scheduled order:', error)
      alert('Failed to delete scheduled order')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // HH:mm format
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending'
      case 'ACTIVE':
        return 'status-active'
      case 'COMPLETED':
        return 'status-completed'
      case 'CANCELLED':
        return 'status-cancelled'
      case 'PAUSED':
        return 'status-paused'
      default:
        return ''
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  return (
    <div className="container scheduled-orders-page">
      <div className="scheduled-orders-header">
        <h1>📅 Bulk Order Planner</h1>
        <button 
          onClick={() => navigate('/scheduled-orders/create')}
          className="btn btn-primary"
        >
          + Schedule New Order
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={filter === 'cancelled' ? 'active' : ''}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {scheduledOrders.length === 0 ? (
        <div className="empty-scheduled-orders">
          <p>No scheduled orders found</p>
          <button 
            onClick={() => navigate('/scheduled-orders/create')}
            className="btn btn-primary"
          >
            Schedule Your First Order
          </button>
        </div>
      ) : (
        <div className="scheduled-orders-list">
          {scheduledOrders.map((order) => (
            <div key={order.id} className="scheduled-order-card">
              <div className="scheduled-order-header">
                <div>
                  <h3>{order.orderName}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  {order.orderType === 'RECURRING' && (
                    <span className="recurring-badge">
                      🔄 {order.recurrenceType}
                    </span>
                  )}
                </div>
                <div className="scheduled-order-actions">
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => {
                          // For now, show a message that edit functionality is coming soon
                          // Or navigate to create page with order data pre-filled
                          alert('Edit functionality is coming soon! For now, please cancel and create a new scheduled order.')
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {order.status === 'ACTIVE' && order.orderType === 'RECURRING' && (
                    <button
                      onClick={() => handlePause(order.id)}
                      className="btn btn-sm btn-warning"
                    >
                      Pause
                    </button>
                  )}
                  {order.status === 'PAUSED' && (
                    <>
                      <button
                        onClick={() => handleResume(order.id)}
                        className="btn btn-sm btn-success"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {(order.status === 'PENDING' || order.status === 'CANCELLED') && (
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="scheduled-order-details">
                <div className="detail-row">
                  <span className="detail-label">Scheduled Date:</span>
                  <span className="detail-value">{formatDate(order.scheduledDate)}</span>
                  {order.scheduledTime && (
                    <span className="detail-value"> at {formatTime(order.scheduledTime)}</span>
                  )}
                </div>
                {order.deliveryDate && (
                  <div className="detail-row">
                    <span className="detail-label">Delivery Date:</span>
                    <span className="detail-value">{formatDate(order.deliveryDate)}</span>
                    {order.deliveryTime && (
                      <span className="detail-value"> at {formatTime(order.deliveryTime)}</span>
                    )}
                  </div>
                )}
                {order.orderType === 'RECURRING' && order.nextExecutionDate && (
                  <div className="detail-row">
                    <span className="detail-label">Next Execution:</span>
                    <span className="detail-value">{formatDate(order.nextExecutionDate)}</span>
                  </div>
                )}
                {order.orderType === 'RECURRING' && order.currentOccurrence > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Executed:</span>
                    <span className="detail-value">{order.currentOccurrence} times</span>
                  </div>
                )}
                {order.items && order.items.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Items:</span>
                    <span className="detail-value">{order.items.length} products</span>
                  </div>
                )}
                {order.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{order.notes}</span>
                  </div>
                )}
              </div>

              {order.items && order.items.length > 0 && (
                <div className="scheduled-order-items">
                  <h4>Order Items:</h4>
                  <div className="items-list">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="item-preview">
                        <span>{item.productName}</span>
                        <span>
                          {item.weight ? `${parseFloat(item.weight).toFixed(2)} lbs` : `${item.quantity}x`}
                          {' '}@ ${parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">+ {order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ScheduledOrders

