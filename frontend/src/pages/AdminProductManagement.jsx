import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import SuccessModal from '../components/SuccessModal'
import './AdminProductManagement.css'

const AdminProductManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    imageUrl: '',
    productCode: '',
    categoryId: '',
    active: true
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/catalog/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      // Use admin endpoint to get product even if inactive/out of stock
      const response = await axios.get(`/api/catalog/products/${id}/admin`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const product = response.data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        imageUrl: product.imageUrl || '',
        productCode: product.productCode || '',
        categoryId: product.categoryId?.toString() || '',
        active: product.active !== undefined ? product.active : true
      })
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      // Validate required fields
      if (!formData.name || !formData.price || !formData.stockQuantity || !formData.categoryId) {
        setError('Please fill in all required fields (Name, Price, Stock, Category)')
        setLoading(false)
        return
      }

      // Clean up empty strings to null
      const cleanString = (str) => {
        if (!str || typeof str !== 'string') return null
        const trimmed = str.trim()
        return trimmed === '' ? null : trimmed
      }

      // Normalize product code - trim and convert to uppercase for consistency (optional)
      let productCode = cleanString(formData.productCode)
      if (productCode) {
        productCode = productCode.trim() // Ensure no leading/trailing spaces
      }

      const payload = {
        name: formData.name.trim(),
        description: cleanString(formData.description),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        imageUrl: cleanString(formData.imageUrl),
        productCode: productCode, // Will be null if empty, or trimmed string if provided
        categoryId: parseInt(formData.categoryId),
        active: formData.active !== undefined ? formData.active : true
      }
      
      // Remove null optional fields to keep payload clean
      if (payload.description === null) delete payload.description
      if (payload.imageUrl === null) delete payload.imageUrl
      if (payload.productCode === null) delete payload.productCode
      
      // Log the payload for debugging
      console.log('Product payload:', payload)
      
      // Validate numeric values
      if (isNaN(payload.price) || payload.price < 0) {
        setError('Price must be a valid positive number')
        setLoading(false)
        return
      }
      
      if (isNaN(payload.stockQuantity) || payload.stockQuantity < 0) {
        setError('Stock quantity must be a valid positive number')
        setLoading(false)
        return
      }
      
      if (isNaN(payload.categoryId)) {
        setError('Please select a valid category')
        setLoading(false)
        return
      }

      console.log('Sending payload:', payload)
      
      let response
      if (isEdit) {
        response = await axios.put(`/api/catalog/products/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('/api/catalog/products', payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
      
      console.log('Response received:', response)

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigate('/admin')
      }, 2000)
    } catch (error) {
      console.error('Error saving product:', error)
      console.error('Error response:', error.response)
      
      let errorMessage = 'Failed to save product'
      if (error.response) {
        console.log('Error response status:', error.response.status)
        console.log('Error response data:', error.response.data)
        console.log('Error response headers:', error.response.headers)
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error
          } else if (Object.keys(error.response.data).length > 0) {
            errorMessage = JSON.stringify(error.response.data)
          } else {
            errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Bad Request'}`
          }
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Bad Request'}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // If still generic, provide more context
      if (errorMessage === 'Failed to save product' && error.response) {
        errorMessage = `Server returned ${error.response.status}. Please check all fields are filled correctly.`
      }
      
      // Make error message more user-friendly
      if (errorMessage.includes('Product code already exists')) {
        setError(`❌ ${errorMessage}. Please use a different product code or leave it empty.`)
      } else if (errorMessage.includes('Category not found')) {
        setError('❌ Invalid category selected. Please select a valid category.')
      } else if (errorMessage.includes('validation failed')) {
        setError(`❌ ${errorMessage}`)
      } else {
        setError(`❌ ${errorMessage}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const isAvailable = formData.active && parseInt(formData.stockQuantity || 0) > 0

  return (
    <div className="container admin-product-management">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>{isEdit ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="e.g., Goat, Regular Chicken"
              />
            </div>
            <div className="form-group">
              <label>Product Code (Optional)</label>
              <input
                type="text"
                name="productCode"
                value={formData.productCode}
                onChange={handleChange}
                className="input"
                placeholder="e.g., MEAT-GOAT-001"
              />
              <small className="form-hint">
                Must be unique. Leave empty to auto-generate or skip.
              </small>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="3"
              placeholder="Product description..."
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Pricing & Stock</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                required
                min="0"
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="availability-status">
            <div className={`status-indicator ${isAvailable ? 'available' : 'unavailable'}`}>
              <span className="status-dot"></span>
              <strong>
                {isAvailable 
                  ? '✓ Available to Customers' 
                  : '✗ Not Available to Customers'}
              </strong>
            </div>
            <p className="status-note">
              {isAvailable 
                ? 'Customers can see and purchase this item'
                : 'Item is hidden from customers (inactive or out of stock)'}
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>Product Image</h2>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="input"
              placeholder="https://example.com/image.jpg"
            />
            <p className="help-text">Enter a direct image URL (e.g., from Unsplash, Imgur, etc.)</p>
          </div>

          {formData.imageUrl && (
            <div className="image-preview">
              <img
                src={formData.imageUrl}
                alt="Preview"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                Image failed to load. Please check the URL.
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Availability</h2>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
              />
              <span>Active (Show to customers)</span>
            </label>
            <p className="help-text">
              Uncheck to hide this product from customers. Stock must also be greater than 0 for customers to see it.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>

      <SuccessModal
        show={showSuccess}
        message={isEdit ? 'Product updated successfully!' : 'Product created successfully!'}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  )
}

export default AdminProductManagement

