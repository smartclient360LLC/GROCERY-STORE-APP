import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>India Foods</h3>
            <p>Your trusted grocery store for fresh products and quality service.</p>
          </div>
          
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>📞 Phone: (801) 555-0123</p>
            <p>📧 Email: info@indiafoods.com</p>
            <p>📍 Address: 4852 S Redwood Rd, Taylorsville, UT 84043</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/products">Products</Link>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
          </div>
          
          <div className="footer-section">
            <h4>Delivery Points</h4>
            <p>📍 Lehi, Utah</p>
            <p>📍 Herriman, Utah</p>
            <p>📍 Saratoga Springs, Utah</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} India Foods. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

