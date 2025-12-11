import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  // Apply admin theme to body when on admin pages
  useEffect(() => {
    const isAdminPage = location.pathname.startsWith('/admin')
    if (isAdminPage) {
      document.body.classList.add('admin-theme')
    } else {
      document.body.classList.remove('admin-theme')
    }
    return () => {
      document.body.classList.remove('admin-theme')
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <nav className={`navbar ${isAdminPage ? 'navbar-admin' : ''}`}>
      <div className="container">
        <div className="navbar-content">
          <Link to={isAdminPage ? "/admin" : "/"} className="navbar-brand">
            <div className="brand-logo">
              <span className="brand-icon">{isAdminPage ? '⚙️' : '🛒'}</span>
              <span className="brand-text">
                <span className="brand-name">{isAdminPage ? 'Admin Panel' : 'India Foods'}</span>
                <span className="brand-tagline">{isAdminPage ? 'Management Dashboard' : 'Fresh & Authentic'}</span>
              </span>
            </div>
          </Link>
          <div className="navbar-links">
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
              <span className="nav-icon">🛍️</span>
              <span>Products</span>
            </Link>
            <Link to="/recipes" className={isActive('/recipes') ? 'active' : ''}>
              <span className="nav-icon">👨‍🍳</span>
              <span>Recipes</span>
            </Link>
            {user ? (
              <>
                <Link to="/cart" className={`cart-link ${isActive('/cart') ? 'active' : ''}`}>
                  <span className="nav-icon">🛒</span>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
                <Link to="/wishlist" className={isActive('/wishlist') ? 'active' : ''}>
                  <span className="nav-icon">❤️</span>
                  <span>Wishlist</span>
                </Link>
                <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
                  <span className="nav-icon">📦</span>
                  <span>Orders</span>
                </Link>
                <Link to="/scheduled-orders" className={isActive('/scheduled-orders') ? 'active' : ''}>
                  <span className="nav-icon">📅</span>
                  <span>Schedule</span>
                </Link>
                <Link to="/carbon-footprint" className={isActive('/carbon-footprint') ? 'active' : ''}>
                  <span className="nav-icon">🌍</span>
                  <span>Carbon</span>
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                    <span className="nav-icon">⚙️</span>
                    <span>Admin</span>
                  </Link>
                )}
                <div className="navbar-user-section">
                  <div className="user-greeting">
                    <span className="greeting-icon">👋</span>
                    <span className="greeting-text">Hi, {user.firstName}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout">
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                  <span className="nav-icon">🔐</span>
                  <span>Login</span>
                </Link>
                <Link to="/register" className={`btn-register ${isActive('/register') ? 'active' : ''}`}>
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

