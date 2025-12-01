import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import SuccessModal from '../components/SuccessModal'
import './CategoryManagement.css'

const CategoryManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      fetchCategory()
    }
  }, [id])

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/catalog/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setFormData({
        name: response.data.name || '',
        description: response.data.description || ''
      })
    } catch (error) {
      console.error('Error fetching category:', error)
      setError('Failed to load category')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        setError('Category name is required')
        setLoading(false)
        return
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null
      }
      
      // Remove null optional fields
      if (payload.description === null) delete payload.description

      console.log('Sending payload:', payload)
      
      let response
      if (isEdit) {
        response = await axios.put(`/api/catalog/categories/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.post('/api/catalog/categories', payload, {
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
      console.error('Error saving category:', error)
      let errorMessage = 'Failed to save category'
      if (error.response) {
        console.log('Error response status:', error.response.status)
        console.log('Error response data:', error.response.data)
        
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
      
      if (errorMessage === 'Failed to save category' && error.response) {
        errorMessage = `Server returned ${error.response.status}. Please check all fields are filled correctly.`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container category-management">
      <div className="category-management-header">
        <h1>{isEdit ? 'Edit Category' : 'Add New Category'}</h1>
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-secondary"
        >
          ← Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-group">
          <label htmlFor="name">
            Category Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
            placeholder="e.g., Groceries, Meat, Dairy"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea"
            rows="4"
            placeholder="Optional description for this category"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>

      {showSuccess && (
        <SuccessModal message={isEdit ? 'Category updated successfully!' : 'Category created successfully!'} />
      )}
    </div>
  )
}

export default CategoryManagement

