import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SuccessModal from '../components/SuccessModal'
import './Auth.css'

const Auth = () => {
  const location = useLocation()
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')
  
  useEffect(() => {
    setIsLogin(location.pathname === '/login')
  }, [location.pathname])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (isLogin) {
      const result = await login(email, password)
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/')
        }, 2000)
      } else {
        setError(result.error)
      }
    } else {
      const result = await register(email, password, firstName, lastName)
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          navigate('/')
        }, 2000)
      } else {
        setError(result.error)
      }
    }
  }

  const switchMode = () => {
    const newMode = !isLogin
    setIsLogin(newMode)
    setError('')
    navigate(newMode ? '/login' : '/register', { replace: true })
  }

  return (
    <>
      <div className={`auth-container ${isLogin ? 'login-mode' : 'register-mode'}`}>
        <div className="auth-box">
          <div className="form-container">
            <div className={`form-box ${isLogin ? 'Login' : 'Register'}`}>
              <form onSubmit={handleSubmit}>
                <h2>{isLogin ? 'Welcome Back!' : 'Create Account'}</h2>
                <p className="form-subtitle">
                  {isLogin 
                    ? 'We are happy to have you with us again' 
                    : 'Join us and start shopping today'}
                </p>
                
                {error && <div className="error-message">{error}</div>}
                
                {!isLogin && (
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                {!isLogin && (
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="input-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isLogin ? undefined : 6}
                  />
                </div>
                
                <button type="submit" className="submit-btn">
                  {isLogin ? 'Login' : 'Sign Up'}
                </button>
                
                <p className="switch-text">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="switch-link" onClick={switchMode}>
                    {isLogin ? 'Sign Up' : 'Login'}
                  </span>
                </p>
              </form>
            </div>
          </div>
          
          <div className="animation-container">
            <div className="animation">
              <div className="animation-content">
                <h1>{isLogin ? 'WELCOME BACK!' : 'HELLO, FRIEND!'}</h1>
                <p>
                  {isLogin 
                    ? 'We are happy to have you with us again. If you need anything, we are here to help.'
                    : 'Enter your personal details and start your journey with us. Discover amazing products and great deals!'}
                </p>
                <div className="animation-features">
                  <div className="feature-item">
                    <span className="feature-icon">🛒</span>
                    <span>Fresh Products</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚚</span>
                    <span>Fast Delivery</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💰</span>
                    <span>Best Prices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuccessModal
        show={showSuccess}
        message={isLogin ? "Login successful! Welcome back!" : "Registration successful! Welcome to India Foods!"}
        onClose={() => setShowSuccess(false)}
      />
    </>
  )
}

export default Auth

