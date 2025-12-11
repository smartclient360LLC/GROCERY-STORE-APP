import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import './CarbonFootprint.css'

const CarbonFootprint = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCarbonSummary()
    } else {
      navigate('/login')
    }
  }, [user])

  const fetchCarbonSummary = async () => {
    try {
      const response = await axios.get(`/api/orders/user/${user.userId}/carbon-summary`)
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching carbon summary:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container">Loading carbon footprint data...</div>
  }

  if (!summary) {
    return (
      <div className="container carbon-footprint-page">
        <h1>🌍 Carbon Footprint Tracker</h1>
        <p>No carbon footprint data available yet. Place an order to start tracking!</p>
      </div>
    )
  }

  const formatCarbon = (kg) => {
    if (!kg || kg === 0) return '0.00'
    return kg.toFixed(2)
  }

  const getCarbonEquivalent = (kg) => {
    // 1 kg CO2 ≈ 2.5 miles driven in a car
    const miles = (kg * 2.5).toFixed(1)
    return miles
  }

  return (
    <div className="container carbon-footprint-page">
      <div className="carbon-header">
        <h1>🌍 Carbon Footprint Tracker</h1>
        <p className="subtitle">Track your environmental impact and make eco-friendly choices</p>
      </div>

      <div className="carbon-summary-cards">
        <div className="carbon-card primary">
          <div className="card-icon">🌱</div>
          <div className="card-content">
            <h2>{summary.ecoBadge || '🛒 Regular Shopper'}</h2>
            <p className="card-label">Your Eco Status</p>
          </div>
        </div>

        <div className="carbon-card">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h2>{formatCarbon(summary.totalCarbonKg)} kg CO₂</h2>
            <p className="card-label">Total Carbon Footprint</p>
            <p className="card-subtext">≈ {getCarbonEquivalent(summary.totalCarbonKg)} miles driven</p>
          </div>
        </div>

        <div className="carbon-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h2>{summary.totalOrders || 0}</h2>
            <p className="card-label">Total Orders</p>
            <p className="card-subtext">Avg: {formatCarbon(summary.averageCarbonPerOrderKg)} kg per order</p>
          </div>
        </div>

        {summary.carbonSavedKg && summary.carbonSavedKg > 0 && (
          <div className="carbon-card success">
            <div className="card-icon">✨</div>
            <div className="card-content">
              <h2>{formatCarbon(summary.carbonSavedKg)} kg</h2>
              <p className="card-label">Carbon Saved</p>
              <p className="card-subtext">Compared to average user</p>
            </div>
          </div>
        )}
      </div>

      <div className="carbon-stats">
        <div className="stat-box">
          <h3>📈 Statistics</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Average per Order:</span>
              <span className="stat-value">{formatCarbon(summary.averageCarbonPerOrderKg)} kg</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Lowest Order:</span>
              <span className="stat-value">{formatCarbon(summary.minCarbonKg)} kg</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Highest Order:</span>
              <span className="stat-value">{formatCarbon(summary.maxCarbonKg)} kg</span>
            </div>
            {summary.firstOrderDate && (
              <div className="stat-item">
                <span className="stat-label">First Order:</span>
                <span className="stat-value">{new Date(summary.firstOrderDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {summary.monthlyFootprints && summary.monthlyFootprints.length > 0 && (
          <div className="stat-box">
            <h3>📅 Monthly Breakdown</h3>
            <div className="monthly-chart">
              {summary.monthlyFootprints.map((month, index) => {
                const maxCarbon = Math.max(...summary.monthlyFootprints.map(m => parseFloat(m.carbonKg)))
                const percentage = (parseFloat(month.carbonKg) / maxCarbon) * 100
                
                return (
                  <div key={index} className="month-bar">
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ height: `${percentage}%` }}
                        title={`${formatCarbon(month.carbonKg)} kg CO₂`}
                      ></div>
                    </div>
                    <div className="bar-label">
                      <span>{new Date(month.month + '-01').toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="bar-value">{formatCarbon(month.carbonKg)} kg</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="carbon-tips">
        <h3>💡 Tips to Reduce Your Carbon Footprint</h3>
        <ul>
          <li>🌱 Choose more plant-based products (fruits, vegetables, grains)</li>
          <li>📦 Opt for eco-friendly packaging when available</li>
          <li>🚚 Combine orders to reduce delivery trips</li>
          <li>🥬 Buy seasonal and local products when possible</li>
          <li>♻️ Consider bulk purchases to reduce packaging</li>
        </ul>
      </div>
    </div>
  )
}

export default CarbonFootprint

