import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './ProductDetails.css'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(1.0) // Weight in pounds
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistId, setWishlistId] = useState(null)
  const [showFamilyListModal, setShowFamilyListModal] = useState(false)
  const [familyAccounts, setFamilyAccounts] = useState([])
  const [selectedListId, setSelectedListId] = useState(null)
  const [addingToList, setAddingToList] = useState(false)
  
  // Check if product is sold by weight (meat, fruits, vegetables)
  const isWeightBased = () => {
    if (!product || !product.categoryName) return false
    const category = product.categoryName.toLowerCase().trim()
    return category === 'meat' || category === 'fruits' || category === 'fruits & vegetables' || 
           category === 'vegetables' || category.includes('fruit') || category.includes('vegetable')
  }

  useEffect(() => {
    fetchProduct()
    if (user) {
      checkWishlistStatus()
      fetchFamilyAccounts()
    }
  }, [id, user])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/catalog/products/${id}`)
      // Backend already checks availability
      setProduct(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      // Product not found or not available
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!user) return
    try {
      const response = await axios.get(`/api/catalog/wishlist/${user.userId}`)
      const wishlistItem = response.data.find(item => item.productId === parseInt(id))
      if (wishlistItem) {
        setIsInWishlist(true)
        setWishlistId(wishlistItem.id)
      }
    } catch (error) {
      console.error('Error checking wishlist:', error)
    }
  }

  const fetchFamilyAccounts = async () => {
    if (!user) return
    try {
      const response = await axios.get(`/api/auth/family/user/${user.userId}`)
      const accounts = response.data
      
      // Fetch lists for each family account
      const accountsWithLists = await Promise.all(
        accounts.map(async (account) => {
          try {
            const listsResponse = await axios.get(
              `/api/auth/family/${account.id}/lists?userId=${user.userId}`
            )
            return {
              ...account,
              lists: listsResponse.data || []
            }
          } catch (error) {
            console.error(`Error fetching lists for family ${account.id}:`, error)
            return {
              ...account,
              lists: []
            }
          }
        })
      )
      
      setFamilyAccounts(accountsWithLists)
    } catch (error) {
      console.error('Error fetching family accounts:', error)
    }
  }

  const toggleWishlist = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      if (isInWishlist) {
        await axios.delete(`/api/catalog/wishlist/${user.userId}/products/${id}`)
        setIsInWishlist(false)
        setWishlistId(null)
        setSuccessMessage('Removed from wishlist')
      } else {
        await axios.post(`/api/catalog/wishlist/${user.userId}/products/${id}`)
        setIsInWishlist(true)
        setSuccessMessage('Added to wishlist')
      }
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      alert('Failed to update wishlist')
    }
  }

  const handleAddToFamilyList = async () => {
    if (!selectedListId) {
      alert('Please select a list')
      return
    }

    setAddingToList(true)
    try {
      const requestBody = {
        productId: product.id,
        productName: product.name,
        quantity: isWeightBased() ? 1 : quantity,
        weight: isWeightBased() ? parseFloat(weight) : null,
        notes: `Added from product page`
      }

      await axios.post(
        `/api/auth/family/lists/${selectedListId}/items?userId=${user.userId}`,
        requestBody
      )

      setSuccessMessage(`Added to family list!`)
      setShowSuccess(true)
      setShowFamilyListModal(false)
      setSelectedListId(null)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to family list:', error)
      alert(error.response?.data?.message || 'Failed to add to family list')
    } finally {
      setAddingToList(false)
    }
  }

  const getAllLists = () => {
    const allLists = []
    familyAccounts.forEach(account => {
      if (account.lists && account.lists.length > 0) {
        account.lists.forEach(list => {
          allLists.push({
            ...list,
            familyName: account.familyName
          })
        })
      }
    })
    return allLists
  }

  const addToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const params = {
        productId: product.id,
        productName: product.name,
        price: product.price
      }
      
      if (isWeightBased()) {
        // For weight-based products, send weight as string
        params.weight = weight.toString()
        params.quantity = 1 // Set quantity to 1 for weight-based items
      } else {
        // For quantity-based products, send quantity
        params.quantity = quantity
      }
      
      await axios.post(`/api/cart/${user.userId}/items`, null, { params })
      refreshCart()
      setSuccessMessage(isWeightBased() 
        ? `${parseFloat(weight).toFixed(2)} lbs of ${product?.name} added to cart successfully!`
        : `${quantity} x ${product?.name} added to cart successfully!`)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add product to cart')
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!product) {
    return (
      <div className="container">
        <div className="product-unavailable">
          <h2>Product Not Available</h2>
          <p>This product is currently unavailable or out of stock.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Other Products
          </button>
        </div>
      </div>
    )
  }
  
  const isAvailable = product.active && product.stockQuantity > 0

  return (
    <div className="container product-details">
      <button 
        onClick={() => navigate('/products')} 
        className="btn-back"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Products
      </button>
      <div className="product-details-content">
        <div className="product-image">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
            }}
          />
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          {product.productCode && (
            <p className="product-code">Product Code: <strong>{product.productCode}</strong></p>
          )}
          <p className="category">{product.categoryName}</p>
          <p className="price">${product.price.toFixed(2)} {isWeightBased() ? 'per lb' : ''}</p>
          <p className="description">{product.description}</p>
          <p className="stock">Stock: {product.stockQuantity}</p>
          {isWeightBased() ? (
            <div className="weight-selector">
              <label>Weight (lbs):</label>
              <div className="weight-input-group">
                <button
                  type="button"
                  className="weight-btn"
                  onClick={() => setWeight(Math.max(0.1, (parseFloat(weight) || 0.1) - 0.5))}
                >
                  −
                </button>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val >= 0.1) {
                      setWeight(val)
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value)
                    if (isNaN(val) || val < 0.1) {
                      setWeight(0.1)
                    } else {
                      // Round to 2 decimal places
                      setWeight(Math.round(val * 100) / 100)
                    }
                  }}
                  className="input weight-input"
                />
                <button
                  type="button"
                  className="weight-btn"
                  onClick={() => setWeight((parseFloat(weight) || 0.1) + 0.5)}
                >
                  +
                </button>
              </div>
              <p className="weight-note">Enter weight in pounds (lbs). Use +/- buttons or type directly (e.g., 2.50)</p>
            </div>
          ) : (
            <div className="quantity-selector">
              <label>Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input"
              />
            </div>
          )}
          <div className="product-actions">
            {isAvailable ? (
              <button onClick={addToCart} className="btn btn-primary">
                Add to Cart
              </button>
            ) : (
            <div className="unavailable-message">
              <p className="unavailable-text">This product is currently unavailable</p>
              {product.stockQuantity === 0 && (
                <p className="stock-message">Out of Stock</p>
              )}
              {!product.active && (
                <p className="stock-message">Product Inactive</p>
              )}
            </div>
            )}
            {user && (
              <>
                <button
                  onClick={toggleWishlist}
                  className={`btn ${isInWishlist ? 'btn-secondary' : 'btn-outline'}`}
                  style={{ marginTop: '0.5rem' }}
                >
                  {isInWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
                </button>
                {familyAccounts.length > 0 && getAllLists().length > 0 && (
                  <button
                    onClick={() => setShowFamilyListModal(true)}
                    className="btn btn-outline"
                    style={{ marginTop: '0.5rem' }}
                  >
                    👨‍👩‍👧‍👦 Add to Family List
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <SuccessModal
        show={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />

      {showFamilyListModal && (
        <div className="modal-overlay" onClick={() => setShowFamilyListModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add to Family List</h2>
            <div className="form-group">
              <label htmlFor="familyList">Select List *</label>
              <select
                id="familyList"
                value={selectedListId || ''}
                onChange={(e) => setSelectedListId(parseInt(e.target.value))}
                className="input"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <option value="">-- Select a list --</option>
                {familyAccounts.map(account => 
                  account.lists && account.lists.length > 0 && (
                    <optgroup key={account.id} label={`${account.familyName}`}>
                      {account.lists.map(list => (
                        <option key={list.id} value={list.id}>
                          {list.listName} {list.isDefault && '(Default)'}
                        </option>
                      ))}
                    </optgroup>
                  )
                )}
              </select>
            </div>
            <div className="form-group">
              <label>Product Details</label>
              <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>{product.name}</strong></p>
                <p>
                  {isWeightBased() 
                    ? `Weight: ${parseFloat(weight).toFixed(2)} lbs`
                    : `Quantity: ${quantity}`
                  }
                </p>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  setShowFamilyListModal(false)
                  setSelectedListId(null)
                }}
                className="btn btn-secondary"
                disabled={addingToList}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToFamilyList}
                className="btn btn-primary"
                disabled={addingToList || !selectedListId}
              >
                {addingToList ? 'Adding...' : 'Add to List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails

