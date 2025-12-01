import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../config/axios'
import { playNotificationSound } from '../utils/soundNotification'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [customerNames, setCustomerNames] = useState({}) // Map of userId to customer name
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [activeTab, setActiveTab] = useState('products')
  const [orderFilter, setOrderFilter] = useState('all') // 'all', 'online', 'pos'
  const [loading, setLoading] = useState(true)
  const previousOrderIdsRef = useRef(new Set()) // Track previous order IDs to detect new orders

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found in localStorage')
        alert('Please log in again')
        return
      }
      
      console.log('Fetching products with token:', token.substring(0, 20) + '...')
      
      // Use admin endpoint to see all products including inactive
      const response = await apiClient.get('/api/catalog/products/admin/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      console.error('Error response:', error.response)
      if (error.response) {
        console.error('Status:', error.response.status)
        console.error('Data:', error.response.data)
        if (error.response.status === 403) {
          alert('Access denied. Please ensure you are logged in as an admin user.')
        } else if (error.response.status === 401) {
          alert('Authentication failed. Please log in again.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/api/catalog/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/orders/admin/all'
      if (orderFilter === 'online') {
        url += '?isPosOrder=false'
      } else if (orderFilter === 'pos') {
        url += '?isPosOrder=true'
      }
      
      const token = localStorage.getItem('token')
      const response = await apiClient.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const allOrders = response.data
      setOrders(allOrders)
      
      // Fetch customer names for online orders
      const onlineOrders = allOrders.filter(order => !order.isPosOrder && order.userId)
      const uniqueUserIds = [...new Set(onlineOrders.map(order => order.userId))]
      const namesMap = {}
      
      // Fetch customer info for each unique user
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const userResponse = await apiClient.get(`/api/auth/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            namesMap[userId] = `${userResponse.data.firstName} ${userResponse.data.lastName}`
          } catch (error) {
            console.error(`Error fetching customer ${userId}:`, error)
            namesMap[userId] = 'Unknown Customer'
          }
        })
      )
      
      setCustomerNames(namesMap)
      
      // Count new orders (PENDING status, created in last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const newOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return order.status === 'PENDING' && orderDate > oneDayAgo
      })
      setNewOrdersCount(newOrders.length)
      
      // Detect new orders and play sound notification (only when admin is on orders tab)
      if (activeTab === 'orders') {
        const currentOrderIds = new Set(allOrders.map(order => order.id))
        const previousOrderIds = previousOrderIdsRef.current
        
        // Check if there are any new orders (orders that weren't in the previous set)
        const hasNewOrders = Array.from(currentOrderIds).some(id => !previousOrderIds.has(id))
        
        console.log('Order check:', {
          currentOrderCount: currentOrderIds.size,
          previousOrderCount: previousOrderIds.size,
          hasNewOrders: hasNewOrders,
          activeTab: activeTab
        })
        
        // Only play sound if:
        // 1. There are new orders
        // 2. Previous order IDs set is not empty (to avoid playing on initial load)
        // 3. Admin is currently on the orders tab (online)
        if (hasNewOrders && previousOrderIds.size > 0) {
          // Count how many new orders
          const newOrderCount = Array.from(currentOrderIds).filter(id => !previousOrderIds.has(id)).length
          
          console.log(`New order detected! Count: ${newOrderCount}`)
          
          // Play notification sound
          playNotificationSound()
          
          // Optional: Show browser notification if permission is granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Order Received!`, {
              body: `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received`,
              icon: '/favicon.ico',
              tag: 'new-order'
            })
          }
        }
        
        // Update previous order IDs for next comparison
        previousOrderIdsRef.current = currentOrderIds
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      await apiClient.delete(`/api/catalog/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // Refresh products list
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product: ' + (error.response?.data?.message || error.message))
    }
  }
  
  // Request notification permission and initialize audio when admin opens orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted')
          }
        })
      }
      
      // Initialize audio context on first interaction (required by browsers)
      if (!window.audioContext) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext
          window.audioContext = new AudioContext()
          console.log('Audio context initialized')
          
          // Resume audio context if suspended (browsers block autoplay)
          if (window.audioContext.state === 'suspended') {
            window.audioContext.resume().then(() => {
              console.log('Audio context resumed and ready')
            }).catch(error => {
              console.warn('Could not resume audio context:', error)
            })
          }
        } catch (error) {
          console.warn('Could not initialize audio context:', error)
        }
      }
    }
  }, [activeTab])

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(fetchOrders, 30000)
      return () => clearInterval(interval)
    }
  }, [activeTab, orderFilter])

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'categories') {
      fetchCategories()
    } else {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orderFilter])

  return (
    <div className="container admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-quick-links">
        <Link to="/admin/pos" className="admin-link-card">
          <div className="link-icon">💰</div>
          <h3>Cash Counter / POS</h3>
          <p>Process offline sales</p>
        </Link>
        <Link to="/admin/sales" className="admin-link-card">
          <div className="link-icon">📊</div>
          <h3>Sales Reports</h3>
          <p>View daily & monthly sales</p>
        </Link>
        <div 
          className="admin-link-card" 
          onClick={() => setActiveTab('products')}
          style={{ cursor: 'pointer' }}
        >
          <div className="link-icon">📦</div>
          <h3>Product Management</h3>
          <p>Add, edit, and manage menu items</p>
        </div>
      </div>
        <div className="admin-tabs">
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
          {newOrdersCount > 0 && (
            <span className="new-orders-badge">{newOrdersCount}</span>
          )}
        </button>
      </div>
      {loading ? (
        <div className="admin-content">
          <p>Loading...</p>
        </div>
      ) : activeTab === 'products' ? (
        <div className="admin-content">
          <div className="products-header">
            <h2>Menu Items / Products</h2>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="btn btn-primary"
            >
              + Add New Menu Item
            </button>
          </div>
          {products.length === 0 ? (
            <p>No products found. Click "Add New Menu Item" to create one.</p>
          ) : (
            <div className="products-grid-admin">
              {products.map(product => {
                const isAvailable = product.active && product.stockQuantity > 0
                return (
                  <div key={product.id} className="product-card-admin">
                    <div className="product-image-admin">
                      <img
                        src={product.imageUrl || 'https://via.placeholder.com/200?text=No+Image'}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200?text=Image+Error'
                        }}
                      />
                      <div className={`availability-badge ${isAvailable ? 'available' : 'unavailable'}`}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </div>
                    </div>
                    <div className="product-info-admin">
                      <h3>{product.name}</h3>
                      {product.productCode && (
                        <p className="product-code-admin">Code: {product.productCode}</p>
                      )}
                      <div className="product-details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Price:</span>
                          <span className="detail-value">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Stock:</span>
                          <span className={`detail-value ${product.stockQuantity === 0 ? 'out-of-stock' : ''}`}>
                            {product.stockQuantity}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Status:</span>
                          <span className={`detail-value ${product.active ? 'active' : 'inactive'}`}>
                            {product.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Category:</span>
                          <span className="detail-value">{product.categoryName || 'N/A'}</span>
                        </div>
                      </div>
                      {product.description && (
                        <p className="product-description-admin">{product.description}</p>
                      )}
                      <div className="product-actions">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="btn btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProduct(product.id)
                          }}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : activeTab === 'categories' ? (
        <div className="admin-content">
          <div className="categories-header">
            <h2>Categories</h2>
            <button
              onClick={() => navigate('/admin/categories/new')}
              className="btn btn-primary"
            >
              + Add New Category
            </button>
          </div>
          {categories.length === 0 ? (
            <p>No categories found. Click "Add New Category" to create one.</p>
          ) : (
            <div className="categories-list">
              {categories.map(category => (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    {category.description && (
                      <p className="category-description">{category.description}</p>
                    )}
                  </div>
                  <div className="category-actions">
                    <button
                      onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Are you sure you want to delete "${category.name}"? This will fail if there are products in this category.`)) {
                          return
                        }
                        try {
                          const token = localStorage.getItem('token')
                          await apiClient.delete(`/api/catalog/categories/${category.id}`, {
                            headers: {
                              Authorization: `Bearer ${token}`
                            }
                          })
                          fetchCategories()
                        } catch (error) {
                          alert('Failed to delete category: ' + (error.response?.data?.message || error.message))
                        }
                      }}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="admin-content">
          <div className="orders-header">
            <h2>All Orders</h2>
            <div className="order-filters">
              <button
                className={orderFilter === 'all' ? 'active' : ''}
                onClick={() => setOrderFilter('all')}
              >
                All Orders
              </button>
              <button
                className={orderFilter === 'online' ? 'active' : ''}
                onClick={() => setOrderFilter('online')}
              >
                Online Sales
              </button>
              <button
                className={orderFilter === 'pos' ? 'active' : ''}
                onClick={() => setOrderFilter('pos')}
              >
                POS Sales
              </button>
            </div>
          </div>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-list">
              {orders.map(order => {
                const isNew = order.status === 'PENDING' && new Date(order.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                return (
                <div 
                  key={order.id} 
                  className={`order-card ${isNew ? 'new-order' : ''}`}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {isNew && <div className="new-order-indicator">NEW</div>}
                  <div className="order-header">
                    <div>
                      <strong>Order #{order.orderNumber}</strong>
                      <span className={`order-type ${order.isPosOrder ? 'pos' : 'online'}`}>
                        {order.isPosOrder ? 'POS' : 'Online'}
                      </span>
                    </div>
                    <div className="order-meta">
                      <span className={`status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="order-details">
                    <div className="order-info">
                      {!order.isPosOrder && order.userId && customerNames[order.userId] ? (
                        <p><strong>Customer:</strong> {customerNames[order.userId]} (ID: {order.userId})</p>
                      ) : (
                        <p><strong>Customer ID:</strong> {order.userId || 'N/A'}</p>
                      )}
                      <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                      {order.shippingAddress && (
                        <p><strong>Shipping:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                      )}
                    </div>
                    <div className="order-items">
                      <strong>Items:</strong>
                      <ul>
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.productName} x{item.quantity} - ${item.subtotal.toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="order-total">
                      <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                    </div>
                    {order.shippingAddress?.deliveryPoint && (
                      <div className="delivery-point-info">
                        <strong>📍 Delivery Point:</strong> {order.shippingAddress.deliveryPoint}
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

