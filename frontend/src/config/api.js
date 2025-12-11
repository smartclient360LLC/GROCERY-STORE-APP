import axios from 'axios'

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401/403 errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      const currentPath = window.location.pathname
      const isPublicRoute = currentPath === '/' || 
                           currentPath.includes('/login') || 
                           currentPath.includes('/register') ||
                           currentPath.includes('/products') || 
                           currentPath.includes('/recipes')
      
      if (!isPublicRoute && !currentPath.includes('/checkout')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setTimeout(() => {
          if (window.location.pathname === currentPath) {
            window.location.href = '/login'
          }
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

