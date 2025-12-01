import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import axios from 'axios'
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
const TAX_RATE = 0.061 // Utah state grocery tax: 6.1%
const DELIVERY_FEE = 10.00 // Delivery fee for orders below $100
const FREE_DELIVERY_THRESHOLD = 100.00 // Free delivery threshold

// Helper function to check if product is rice or atta by category name
const isRiceOrAtta = (categoryName) => {
  if (!categoryName) return false
  const category = categoryName.toLowerCase().trim()
  return category === 'rice' || category === 'atta'
}

const CheckoutForm = ({ cart, shippingAddress, setShippingAddress, deliveryPoint, minOrderMet, subtotal, taxAmount, deliveryFee }) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const [processing, setProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)

    try {
      // Validate required fields before proceeding
      if (!cart || !cart.items || cart.items.length === 0) {
        alert('Your cart is empty. Please add items to your cart before checkout.')
        setProcessing(false)
        navigate('/cart')
        return
      }

      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
        alert('Please fill in all shipping address fields.')
        setProcessing(false)
        return
      }

      if (!deliveryPoint) {
        alert('Please select a delivery point.')
        setProcessing(false)
        return
      }

      if (!minOrderMet) {
        alert('Minimum order requirements not met. Please add more items to your cart.')
        setProcessing(false)
        return
      }

      if (!user || !user.userId) {
        alert('User information is missing. Please log in again.')
        setProcessing(false)
        navigate('/login')
        return
      }

      // Create order with delivery point info
      const selectedDeliveryPoint = deliveryPoint ? DELIVERY_POINTS.find(dp => dp.id === deliveryPoint) : null
      
      console.log('Creating order with data:', {
        userId: user.userId,
        itemsCount: cart.items.length,
        deliveryPoint: selectedDeliveryPoint?.name
      })

      let orderResponse
      try {
        orderResponse = await axios.post('/api/orders', {
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
            deliveryPoint: selectedDeliveryPoint ? selectedDeliveryPoint.name : null
          },
          paymentMethod: 'ONLINE',
          isPosOrder: false
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      } catch (orderError) {
        console.error('Order creation error:', orderError)
        const errorMessage = orderError.response?.data?.message || orderError.message || 'Failed to create order'
        alert(`Order creation failed: ${errorMessage}`)
        setProcessing(false)
        return
      }

      const order = orderResponse.data
      console.log('Order created successfully:', order.orderNumber)
      console.log('Order total amount:', order.totalAmount)

      // Validate order total before creating payment intent
      if (!order.totalAmount || order.totalAmount <= 0) {
        alert('Invalid order total. Please contact support.')
        setProcessing(false)
        return
      }

      if (order.totalAmount < 0.50) {
        alert('Order total must be at least $0.50. Please add more items to your cart.')
        setProcessing(false)
        return
      }

      // Create payment intent (use order total which includes tax)
      console.log('Creating payment intent for order:', order.orderNumber, 'Amount:', order.totalAmount)
      
      let paymentResponse
      try {
        // Ensure amount is a number, not a string
        const amount = typeof order.totalAmount === 'string' 
          ? parseFloat(order.totalAmount) 
          : Number(order.totalAmount)
        
        if (isNaN(amount) || amount <= 0) {
          alert(`Invalid order total: ${order.totalAmount}. Please contact support.`)
          setProcessing(false)
          return
        }
        
        const paymentRequest = {
          orderNumber: order.orderNumber,
          userId: Number(user.userId), // Ensure userId is a number
          amount: amount, // Ensure amount is a number
          currency: 'usd'
        }
        console.log('Payment intent request:', paymentRequest)
        console.log('Payment request types:', {
          orderNumber: typeof paymentRequest.orderNumber,
          userId: typeof paymentRequest.userId,
          amount: typeof paymentRequest.amount,
          currency: typeof paymentRequest.currency
        })
        
        paymentResponse = await axios.post('/api/payments/create-intent', paymentRequest, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      } catch (paymentError) {
        console.error('Payment intent creation error:', paymentError)
        console.error('Payment error response:', paymentError.response?.data)
        
        // Extract error message from response
        let errorMessage = 'Failed to create payment intent'
        if (paymentError.response?.data) {
          const errorData = paymentError.response.data
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } else if (paymentError.message) {
          errorMessage = paymentError.message
        }
        
        alert(`Payment setup failed: ${errorMessage}`)
        setProcessing(false)
        return
      }

      const { clientSecret } = paymentResponse.data
      
      if (!clientSecret) {
        alert('Payment setup failed: No client secret received')
        setProcessing(false)
        return
      }

      console.log('Payment intent created successfully')

      // Confirm payment with 3D Secure support
      console.log('Confirming payment with Stripe...')
      const cardElement = elements.getElement(CardElement)
      
      if (!cardElement) {
        alert('Card element not found. Please refresh the page and try again.')
        setProcessing(false)
        return
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user.name || user.email,
            email: user.email
          }
        }
      })

      if (error) {
        // Handle specific error types
        let errorMessage = error.message
        if (error.type === 'card_error') {
          errorMessage = `Card error: ${error.message}`
        } else if (error.type === 'validation_error') {
          errorMessage = `Validation error: ${error.message}`
        } else {
          errorMessage = `Payment failed: ${error.message}`
        }
        alert(errorMessage)
        setProcessing(false)
        return
      }

      // Handle different payment intent statuses
      if (paymentIntent.status === 'succeeded') {
        // Payment successful - clear cart and show success
        await axios.delete(`/api/cart/${user.userId}`)
        refreshCart()
        
        // Show success modal first
        setShowSuccess(true)
        
        // After showing success, navigate to receipt page
        setTimeout(() => {
          setShowSuccess(false)
          // Navigate to receipt page with order ID
          navigate(`/orders/receipt?orderId=${order.id}&success=true`)
        }, 2000)
      } else if (paymentIntent.status === 'requires_action') {
        // 3D Secure authentication required
        // Stripe.js will automatically handle this, but we should inform the user
        alert('Please complete the authentication on your card.')
        setProcessing(false)
      } else if (paymentIntent.status === 'processing') {
        // Payment is processing (e.g., for some card types)
        alert('Your payment is being processed. Please wait...')
        setProcessing(false)
      } else {
        // Other statuses (requires_payment_method, canceled, etc.)
        alert(`Payment status: ${paymentIntent.status}. Please try again.`)
        setProcessing(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      })
      
      // Provide more specific error messages
      let errorMessage = 'Checkout failed. Please try again.'
      
      if (error.response) {
        // Server responded with error
        const status = error.response.status
        const data = error.response.data
        
        if (status === 401) {
          errorMessage = 'Authentication failed. Please log in again.'
        } else if (status === 403) {
          errorMessage = 'Access denied. Please check your permissions.'
        } else if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your information.'
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.'
        } else {
          errorMessage = data?.message || `Error: ${status}. Please try again.`
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (error.message) {
        // Error setting up the request
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Card Details</label>
          <CardElement />
        </div>
        <button
          type="submit"
          disabled={!stripe || processing || !minOrderMet || !deliveryPoint}
          className="btn btn-primary"
        >
          {processing ? 'Processing...' : `Pay $${(subtotal + taxAmount).toFixed(2)}`}
        </button>
        {!minOrderMet && (
          <p className="error-text">Minimum order requirement not met. Please add more items.</p>
        )}
        {!deliveryPoint && (
          <p className="error-text">Please select a delivery point.</p>
        )}
      </form>
      {showSuccess && (
        <SuccessModal
          show={showSuccess}
          message="Payment successful! Redirecting to your receipt..."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
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
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCart()
    } else {
      navigate('/login')
    }
  }, [user])

  const fetchCart = async () => {
    try {
      const response = await axios.get(`/api/cart/${user.userId}`)
      setCart(response.data)
      if (!response.data || response.data.items.length === 0) {
        navigate('/cart')
        return
      }
      
      // Fetch product details to get categories
      const productDetails = {}
      let meatTotal = 0
      let groceryTotalForMinOrder = 0 // For minimum order calculation (only one rice/atta counts)
      let groceryTotalForDisplay = 0 // For display (all items)
      let hasRiceAtta = false // Track if we've already counted one rice/atta
      
      for (const item of response.data.items) {
        try {
          const productResponse = await axios.get(`/api/catalog/products/${item.productId}`)
          const product = productResponse.data
          productDetails[item.productId] = product
          
          // Calculate item total: use weight if available, otherwise use quantity
          const itemTotal = item.weight && item.weight > 0 
            ? item.price * item.weight 
            : item.price * item.quantity
          const isMeat = product.categoryName && product.categoryName.toLowerCase().trim() === 'meat'
          const isRiceAtta = isRiceOrAtta(product.categoryName)
          
          if (isMeat) {
            meatTotal += itemTotal
          } else {
            // For grocery items
            groceryTotalForDisplay += itemTotal
            
            // For minimum order calculation: only ONE rice/atta bag counts
            if (isRiceAtta) {
              if (!hasRiceAtta) {
                // First rice/atta item - count only ONE unit price towards minimum
                groceryTotalForMinOrder += item.price
                hasRiceAtta = true
              }
              // Additional rice/atta items don't count towards minimum order
            } else {
              // Non-rice/atta grocery items count fully
              groceryTotalForMinOrder += itemTotal
            }
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error)
        }
      }
      
      // Calculate subtotal (before tax) - use display total
      const calculatedSubtotal = response.data.total || (meatTotal + groceryTotalForDisplay)
      
      // Calculate tax (6.1% of subtotal)
      const calculatedTax = calculatedSubtotal * TAX_RATE
      
      // Calculate amount after tax
      const amountAfterTax = calculatedSubtotal + calculatedTax
      
      // Calculate delivery fee: $10 if order total (subtotal + tax) is below $100
      const calculatedDeliveryFee = amountAfterTax < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
      
      setProducts(productDetails)
      setMeatTotal(meatTotal)
      setGroceryTotal(groceryTotalForDisplay) // Use display total for UI
      setSubtotal(calculatedSubtotal)
      setTaxAmount(calculatedTax)
      setDeliveryFee(calculatedDeliveryFee)
      
      // Minimum order met if: (no meat OR meat >= $50) AND (no grocery OR grocery >= $100)
      // Use groceryTotalForMinOrder which only counts one rice/atta bag
      const meatOk = meatTotal === 0 || meatTotal >= MEAT_MIN_ORDER
      const groceryOk = groceryTotalForMinOrder === 0 || groceryTotalForMinOrder >= GROCERY_MIN_ORDER
      setMinOrderMet(meatOk && groceryOk)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container">Loading...</div>
  }

  if (!cart) {
    return <div className="container">Cart not found</div>
  }

  const getMinOrderMessage = () => {
    const messages = []
    if (meatTotal > 0 && meatTotal < MEAT_MIN_ORDER) {
      messages.push(`Meat: $${(MEAT_MIN_ORDER - meatTotal).toFixed(2)} more needed (min $${MEAT_MIN_ORDER})`)
    }
    // Calculate grocery total for minimum order (only one rice/atta counts)
    let groceryTotalForMin = 0
    let hasRiceAtta = false
    for (const item of cart.items) {
      const product = products[item.productId]
      if (product && product.categoryName && product.categoryName.toLowerCase().trim() !== 'meat') {
        const isRiceAtta = isRiceOrAtta(product.categoryName)
        if (isRiceAtta) {
          if (!hasRiceAtta) {
            groceryTotalForMin += item.price // Only count one unit
            hasRiceAtta = true
          }
        } else {
          // For non-rice/atta grocery items, use weight if available, otherwise quantity
          const itemValue = item.weight && item.weight > 0 
            ? item.price * item.weight 
            : item.price * item.quantity
          groceryTotalForMin += itemValue
        }
      }
    }
    if (groceryTotalForMin > 0 && groceryTotalForMin < GROCERY_MIN_ORDER) {
      messages.push(`Grocery: $${(GROCERY_MIN_ORDER - groceryTotalForMin).toFixed(2)} more needed (min $${GROCERY_MIN_ORDER})`)
      messages.push(`Note: Only one bag of rice/atta counts towards the $${GROCERY_MIN_ORDER} minimum`)
    }
    return messages
  }

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
            <label>Street</label>
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
          <h2>Payment</h2>
          <p className="payment-note">💳 Card payment only (Cash payment available at store POS)</p>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              cart={cart}
              shippingAddress={shippingAddress}
              setShippingAddress={setShippingAddress}
              deliveryPoint={deliveryPoint}
              minOrderMet={minOrderMet}
              subtotal={subtotal}
              taxAmount={taxAmount}
              deliveryFee={deliveryFee}
            />
          </Elements>
        </div>
        <div className="checkout-summary">
          <h2>Order Summary</h2>
          {cart.items.map(item => {
            const product = products[item.productId]
            const isMeat = product?.categoryName?.toLowerCase() === 'meat'
            return (
              <div key={item.id} className="summary-item">
                <span>
                  {item.productName} {item.weight && item.weight > 0 ? `${item.weight} lbs` : `x ${item.quantity}`}
                  {isMeat && <span className="category-badge meat">Meat</span>}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            )
          })}
          
          {meatTotal > 0 && (
            <div className="summary-category">
              <span>Meat Subtotal</span>
              <span className={meatTotal >= MEAT_MIN_ORDER ? 'met' : 'not-met'}>
                ${meatTotal.toFixed(2)} {meatTotal >= MEAT_MIN_ORDER ? '✓' : `(min $${MEAT_MIN_ORDER})`}
              </span>
            </div>
          )}
          
          {groceryTotal > 0 && (
            <div className="summary-category">
              <span>Grocery Subtotal</span>
              <span className={groceryTotal >= GROCERY_MIN_ORDER ? 'met' : 'not-met'}>
                ${groceryTotal.toFixed(2)} {groceryTotal >= GROCERY_MIN_ORDER ? '✓' : `(min $${GROCERY_MIN_ORDER})`}
              </span>
            </div>
          )}
          
          {!minOrderMet && (
            <div className="min-order-warning">
              <strong>Minimum Order Requirements:</strong>
              <ul>
                {getMinOrderMessage().map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          
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
            <span>${(subtotal + taxAmount + deliveryFee).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

