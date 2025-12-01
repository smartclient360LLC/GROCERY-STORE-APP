import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../config/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchCartCount = async () => {
    if (!user) {
      setCartCount(0)
      return
    }

    try {
      const response = await apiClient.get(`/api/cart/${user.userId}`)
      const itemCount = response.data?.itemCount || 0
      setCartCount(itemCount)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartCount(0)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCartCount()
      // Refresh cart count every 5 seconds
      const interval = setInterval(fetchCartCount, 5000)
      return () => clearInterval(interval)
    } else {
      setCartCount(0)
    }
  }, [user])

  const refreshCart = () => {
    fetchCartCount()
  }

  return (
    <CartContext.Provider value={{ cartCount, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  )
}

