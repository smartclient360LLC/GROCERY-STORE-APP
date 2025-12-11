import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import apiClient from '../config/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SuccessModal from '../components/SuccessModal'
import './Checkout.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_stripe_public_key')

const DELIVERY_POINTS = [
  { id: 1, name: 'Lehi', address: 'Lehi, Utah' },
  { id: 2, name: 'Herriman', address: 'Herriman, Utah' },
  { id: 3, name: 'Saratoga Springs', address: 'Saratoga Springs, Utah' }
]

const MEAT_MIN_ORDER = 50
const GROCERY_MIN_ORDER = 100
const TAX_RATE = 0.061
const DELIVERY_FEE = 10.00
const FREE_DELIVERY_THRESHOLD = 100.00

const isRiceOrAtta = (categoryName) => {
  if (!categoryName) return false
  const category = categoryName.toLowerCase().trim()
  return category === 'rice' || category === 'atta'
}

// Payment Form Component
const PaymentForm = ({ order, totalAmount, onSuccess, onError }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handlePayment = async () => {
    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.')
      return
    }

    // Verify user and token before proceeding
    const token = localStorage.getItem('token')
    if (!token) {
      setError('You are not logged in. Please log in again.')
      return
    }

    if (!user || !user.userId) {
      setError('User information is missing. Please refresh the page.')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Step 1: Create Payment Intent
      const paymentRequest = {
        orderNumber: order.orderNumber,
        userId: user.userId,
        amount: parseFloat(totalAmount),
        currency: 'usd'
      }

      console.log('Creating payment intent...', paymentRequest)
      console.log('Token present:', !!token)
      console.log('User ID:', user.userId)
      
      const paymentResponse = await apiClient.post('/api/payments/create-intent', paymentRequest)
      const { clientSecret } = paymentResponse.data

      if (!clientSecret) {
        throw new Error('No client secret received from payment service.')
      }

      console.log('Payment intent created, confirming payment...')

      // Step 2: Confirm Payment with Stripe
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found.')
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${user.firstName} ${user.lastName}`.trim() || user.email,
            email: user.email
          }
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed.')
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful - order remains PENDING until admin confirms
        // Stock will be updated when admin confirms the order
        
        // Clear cart and show success
        await apiClient.delete(`/api/cart/${user.userId}`)
        refreshCart()
        onSuccess()
      } else if (paymentIntent.status === 'requires_action') {
        setError('Please complete the authentication on your card.')
        setProcessing(false)
      } else {
        setError(`Payment status: ${paymentIntent.status}. Please try again.`)
        setProcessing(false)
      }

    } catch (err) {
      console.error('Payment error:', err)
      
      let errorMessage = 'Payment failed. Please try again.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setProcessing(false)
      onError(errorMessage)
    }
  }

  return (
    <div className="payment-form-container">
      <h2>Payment</h2>
      <p className="payment-note">💳 Enter your card details to complete the order</p>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Card Details</label>
        <div className="stripe-card-wrapper">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePayment}
        disabled={!stripe || processing}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {processing ? 'Processing Payment...' : `Pay $${totalAmount.toFixed(2)}`}
      </button>
    </div>
  )
}

const Checkout = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [products, setProducts] = useState({})
  const [deliveryPoint, setDeliveryPoint] = useState(null)
  const [meatTotal, setMeatTotal] = useState(0)
  const [groceryTotal, setGroceryTotal] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [minOrderMet, setMinOrderMet] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!user && (!token || !userData)) {
      // Only redirect if there's no token at all
      console.log('No user or token found, redirecting to login')
      navigate('/login')
      return
    }
    
    // If we have token but no user state, try to parse it
    if (!user && token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        // User will be set by AuthContext, just wait
        return
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    const fetchCart = async () => {
      try {
        const response = await apiClient.get(`/api/cart/${user.userId}`)
        setCart(response.data)
      } catch (error) {
        console.error('Error fetching cart:', error)
        // Don't redirect - just show error or handle gracefully
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication error - user may need to log in again')
          // Don't auto-redirect, let user see the error
        }
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('/api/catalog/products')
        const productsMap = {}
        response.data.forEach(product => {
          productsMap[product.id] = product
        })
        setProducts(productsMap)
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchCart()
    fetchProducts()
  }, [user, navigate])

  useEffect(() => {
    if (!cart || !products || !cart.items || cart.items.length === 0) {
      setSubtotal(0)
      setTaxAmount(0)
      setDeliveryFee(0)
      setMeatTotal(0)
      setGroceryTotal(0)
      setMinOrderMet(false)
      return
    }

    let meatSum = 0
    let grocerySum = 0
    let total = 0

    console.log('Calculating totals for', cart.items.length, 'items')
    
    cart.items.forEach((item, index) => {
      const product = products[item.productId]
      if (!product) {
        console.warn(`Product not found for item ${index}:`, item.productId)
        return
      }

      // Calculate item total - use weight if available, otherwise use quantity
      // Ensure we're using numbers, not strings
      const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price)
      const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : Number(item.quantity)
      const weight = item.weight ? (typeof item.weight === 'string' ? parseFloat(item.weight) : Number(item.weight)) : 0
      
      const itemTotal = weight > 0 
        ? price * weight
        : price * quantity

      console.log(`Item ${index + 1}: ${item.productName}`, {
        price: item.price,
        quantity: item.quantity,
        weight: item.weight,
        itemTotal: itemTotal.toFixed(2)
      })

      total += itemTotal

      const categoryName = product.categoryName?.toLowerCase() || ''
      if (categoryName === 'meat') {
        meatSum += itemTotal
      } else if (!isRiceOrAtta(categoryName)) {
        grocerySum += itemTotal
      }
    })

    console.log('Calculation summary:', {
      total: total.toFixed(2),
      meatSum: meatSum.toFixed(2),
      grocerySum: grocerySum.toFixed(2)
    })

    setMeatTotal(meatSum)
    setGroceryTotal(grocerySum)
    setSubtotal(total)

    const tax = total * TAX_RATE
    setTaxAmount(tax)

    const amountAfterTax = total + tax
    const fee = amountAfterTax < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
    setDeliveryFee(fee)

    const meatMet = meatSum === 0 || meatSum >= MEAT_MIN_ORDER
    const groceryMet = grocerySum === 0 || grocerySum >= GROCERY_MIN_ORDER
    setMinOrderMet(meatMet && groceryMet)
  }, [cart, products])

  const handleOrderSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!cart?.items?.length) {
      setError('Your cart is empty.')
      return
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      setError('Please fill in all shipping address fields.')
      return
    }

    if (!deliveryPoint) {
      setError('Please select a delivery point.')
      return
    }

    if (!minOrderMet) {
      setError('Minimum order requirements not met.')
      return
    }

    if (!user?.userId) {
      setError('Please log in to continue.')
      // Don't auto-redirect - show error message
      return
    }

    setProcessing(true)

    try {
      // Verify token exists before making request
      const token = localStorage.getItem('token')
      if (!token) {
        setError('You are not logged in. Please log in again.')
        setProcessing(false)
        return
      }

      // Check if token might be expired by trying to decode it
      try {
        const tokenParts = token.split('.')
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format')
        }
        const payload = JSON.parse(atob(tokenParts[1]))
        const exp = payload.exp * 1000 // Convert to milliseconds
        if (Date.now() > exp) {
          setError('Your session has expired. Please log in again.')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setProcessing(false)
          return
        }
        console.log('Token is valid, expires at:', new Date(exp))
      } catch (e) {
        console.error('Error checking token:', e)
        // Continue anyway - let backend validate
      }

      const selectedDeliveryPoint = DELIVERY_POINTS.find(dp => dp.id === deliveryPoint)
      
      const orderData = {
        userId: user.userId,
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.weight && item.weight > 0 ? 1 : item.quantity,
          weight: item.weight && item.weight > 0 ? item.weight : null
        })),
        shippingAddress: {
          ...shippingAddress,
          deliveryPoint: selectedDeliveryPoint?.name || null
        },
        paymentMethod: 'ONLINE',
        isPosOrder: false
      }

      console.log('Creating order...', orderData)
      console.log('Token present:', !!token)
      console.log('Token length:', token?.length)
      console.log('User ID from user object:', user.userId)
      
      const orderResponse = await apiClient.post('/api/orders', orderData).catch(err => {
        console.error('Order creation failed:', err)
        console.error('Response status:', err.response?.status)
        console.error('Response data:', err.response?.data)
        console.error('Response headers:', err.response?.headers)
        throw err
      })
      const order = orderResponse.data

      if (!order?.orderNumber) {
        throw new Error('Invalid order response from server.')
      }

      console.log('Order created successfully:', order.orderNumber)
      
      // Set created order and show payment form
      setCreatedOrder(order)
      setShowPaymentForm(true)
      setProcessing(false)

    } catch (err) {
      console.error('Order creation error:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      
      let errorMessage = 'Failed to create order. Please try again.'
      
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Your session may have expired. Please log in again.'
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Show error message - don't auto-redirect
      setError(errorMessage)
      
      // Only clear auth if it's an auth error
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.error('Authentication error - clearing token')
        // Don't clear immediately - let user see the error first
      }
      
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      navigate(`/orders/receipt?orderId=${createdOrder.id}&success=true`)
    }, 2000)
  }

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage)
  }

  const totalAmount = subtotal + taxAmount + deliveryFee

  return (
    <div className="container checkout">
      <button 
        onClick={() => navigate('/cart')} 
        className="btn-back"
        style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        ← Back to Cart
      </button>
      <h1>Checkout</h1>
      
      <div className="checkout-content">
        <div className="checkout-form-section">
          {!showPaymentForm ? (
            <form onSubmit={handleOrderSubmit}>
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <h2>Delivery Point</h2>
              <div className="delivery-points">
                {DELIVERY_POINTS.map(point => (
                  <div
                    key={point.id}
                    className={`delivery-point-card ${deliveryPoint === point.id ? 'selected' : ''}`}
                    onClick={() => setDeliveryPoint(point.id)}
                  >
                    <h3>{point.name}</h3>
                    <p>{point.address}</p>
                  </div>
                ))}
              </div>

              <h2>Shipping Address</h2>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={processing || !minOrderMet || !deliveryPoint}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {processing ? 'Creating Order...' : `Continue to Payment - $${totalAmount.toFixed(2)}`}
              </button>

              {!minOrderMet && (
                <p className="error-text">Minimum order requirement not met. Please add more items.</p>
              )}
              {!deliveryPoint && (
                <p className="error-text">Please select a delivery point.</p>
              )}
            </form>
          ) : (
            <Elements 
              stripe={stripePromise}
              options={{
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#4f46e5',
                    colorBackground: '#ffffff',
                    colorText: '#1a1a1a',
                    colorDanger: '#df1b41',
                    fontFamily: 'system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm
                order={createdOrder}
                totalAmount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cart?.items.map(item => {
            const product = products[item.productId]
            const isMeat = product?.categoryName?.toLowerCase() === 'meat'
            return (
              <div key={item.id} className="summary-item">
                <div>
                  <strong>{item.productName}</strong>
                  <div className="summary-item-details">
                    {item.weight && item.weight > 0 ? (
                      <span>{item.weight} {product?.unit || 'lb'}</span>
                    ) : (
                      <span>Qty: {item.quantity}</span>
                    )}
                    {isMeat && <span className="category-badge">Meat</span>}
                  </div>
                </div>
                <div className="summary-item-price">
                  ${(() => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price)
                    const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) : Number(item.quantity)
                    const weight = item.weight ? (typeof item.weight === 'string' ? parseFloat(item.weight) : Number(item.weight)) : 0
                    return (weight > 0 ? price * weight : price * quantity).toFixed(2)
                  })()}
                </div>
              </div>
            )
          })}
          <div className="summary-subtotal">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-tax">
            <span>Tax (6.1%)</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="summary-delivery-fee">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {deliveryFee === 0 && subtotal + taxAmount >= FREE_DELIVERY_THRESHOLD && (
            <div className="summary-free-delivery">
              <span>Delivery</span>
              <span className="free-delivery-badge">FREE</span>
            </div>
          )}
          <div className="summary-total">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          {!minOrderMet && !showPaymentForm && (
            <div className="min-order-warning">
              <strong>⚠️ Minimum Order Requirements:</strong>
              <ul>
                {meatTotal > 0 && meatTotal < MEAT_MIN_ORDER && (
                  <li>Meat: ${(MEAT_MIN_ORDER - meatTotal).toFixed(2)} more needed (min ${MEAT_MIN_ORDER})</li>
                )}
                {groceryTotal > 0 && groceryTotal < GROCERY_MIN_ORDER && (
                  <li>Grocery: ${(GROCERY_MIN_ORDER - groceryTotal).toFixed(2)} more needed (min ${GROCERY_MIN_ORDER})</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          show={showSuccess}
          message="Payment successful! Redirecting to your receipt..."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}

export default Checkout
