import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛒</span>
            India Foods
          </Link>
          <div className="navbar-links">
            <Link to="/products">Products</Link>
            <Link to="/recipes">Recipes</Link>
            {user ? (
              <>
                <Link to="/cart" className="cart-link">
                  Cart
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                </Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/orders">Orders</Link>
                {isAdmin() && <Link to="/admin">Admin</Link>}
                <span className="navbar-user">Hello, {user.firstName}</span>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

