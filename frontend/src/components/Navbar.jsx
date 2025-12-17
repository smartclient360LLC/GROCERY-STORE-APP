import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import ConfirmDialog from './ConfirmDialog'
import './Navbar.css'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/')
    setShowLogoutConfirm(false)
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
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
              <span className="brand-text">
                <span className="brand-name">{isAdminPage ? 'Admin Panel' : 'India Foods'}</span>
                <span className="brand-tagline">{isAdminPage ? 'Management Dashboard' : 'Fresh & Authentic'}</span>
              </span>
            </div>
          </Link>
          <div className="navbar-links">
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
              Products
            </Link>
            <Link to="/recipes" className={isActive('/recipes') ? 'active' : ''}>
              Recipes
            </Link>
            {user ? (
              <>
                <Link to="/cart" className={`cart-link ${isActive('/cart') ? 'active' : ''}`}>
                  Cart
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
                <Link to="/wishlist" className={isActive('/wishlist') ? 'active' : ''}>
                  Wishlist
                </Link>
                <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
                  Orders
                </Link>
                <Link to="/scheduled-orders" className={isActive('/scheduled-orders') ? 'active' : ''}>
                  Schedule
                </Link>
                <Link to="/carbon-footprint" className={isActive('/carbon-footprint') ? 'active' : ''}>
                  Carbon
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
                    Admin
                  </Link>
                )}
                <div className="navbar-user-section">
                  <div className="user-greeting">
                    <span className="greeting-text">Hi, {user.firstName}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={isActive('/login') ? 'active' : ''}>
                  Login
                </Link>
                <Link to="/register" className={`btn-register ${isActive('/register') ? 'active' : ''}`}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmDialog
        show={showLogoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </nav>
  )
}

export default Navbar

