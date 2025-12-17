import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = ({ children }) => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default Layout

