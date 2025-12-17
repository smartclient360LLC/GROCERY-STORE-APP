import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Auth from './pages/Auth'
import Login from './pages/Login'
import Register from './pages/Register'
import OrderHistory from './pages/OrderHistory'
import OrderReceipt from './pages/OrderReceipt'
import RecipeList from './pages/RecipeList'
import RecipeDetails from './pages/RecipeDetails'
import Wishlist from './pages/Wishlist'
import ScheduledOrders from './pages/ScheduledOrders'
import CreateScheduledOrder from './pages/CreateScheduledOrder'
import CarbonFootprint from './pages/CarbonFootprint'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrderDetails from './pages/AdminOrderDetails'
import AdminProductManagement from './pages/AdminProductManagement'
import CategoryManagement from './pages/CategoryManagement'
import PosCounter from './pages/PosCounter'
import SalesReports from './pages/SalesReports'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Layout>
              <Routes>
              <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/recipes" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scheduled-orders"
              element={
                <ProtectedRoute>
                  <ScheduledOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scheduled-orders/create"
              element={
                <ProtectedRoute>
                  <CreateScheduledOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carbon-footprint"
              element={
                <ProtectedRoute>
                  <CarbonFootprint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/receipt"
              element={
                <ProtectedRoute>
                  <OrderReceipt />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pos"
              element={
                <ProtectedRoute adminOnly>
                  <PosCounter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <ProtectedRoute adminOnly>
                  <SalesReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminOrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <AdminProductManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/new"
              element={
                <ProtectedRoute adminOnly>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories/:id/edit"
              element={
                <ProtectedRoute adminOnly>
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />
              </Routes>
            </Layout>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

