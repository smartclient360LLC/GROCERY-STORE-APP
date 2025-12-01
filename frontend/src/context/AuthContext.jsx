import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../config/axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      // Token is automatically added by axios interceptor
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password })
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      // Token is automatically added by axios interceptor
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      })
      const { token, ...userData } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      // Token is automatically added by axios interceptor
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Token removal handled by interceptor
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role === 'ADMIN'
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

