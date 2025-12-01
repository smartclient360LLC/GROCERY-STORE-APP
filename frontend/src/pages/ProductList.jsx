import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './ProductList.css'

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...')
      const response = await axios.get('/api/catalog/categories')
      console.log('Categories response:', response.data)
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data)
      } else {
        console.warn('Unexpected categories response format:', response.data)
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      setCategories([])
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const url = selectedCategory
        ? `/api/catalog/products/category/${selectedCategory}`
        : '/api/catalog/products'
      console.log('Fetching products from:', url)
      const response = await axios.get(url)
      console.log('Products response:', response.data)
      // Backend already filters to show only available products
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data)
        setFilteredProducts(response.data)
      } else {
        console.warn('Unexpected response format:', response.data)
        setProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      })
      // Set empty arrays on error so UI shows "No products" instead of hanging
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.productCode && p.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  return (
    <div className="container product-list">
      <h1>Our Products</h1>
      <div className="product-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or product code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        <div className="category-filter">
          <button
            className={selectedCategory === null ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={selectedCategory === category.id ? 'active' : ''}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="loading-message">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="no-products-message">
          <p>No products available at the moment.</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
            {products.length === 0 
              ? 'Please check if the catalog service is running and has products in the database.'
              : 'Try adjusting your search or category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/300'}
                alt={product.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';
                }}
              />
              <h3>{product.name}</h3>
              {product.productCode && (
                <p className="product-code">Code: {product.productCode}</p>
              )}
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="stock">Stock: {product.stockQuantity}</p>
              <Link to={`/products/${product.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductList

