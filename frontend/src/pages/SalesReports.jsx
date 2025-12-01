import { useState, useEffect } from 'react'
import axios from 'axios'
import './SalesReports.css'

const SalesReports = () => {
  const [dailyReport, setDailyReport] = useState(null)
  const [monthlyReports, setMonthlyReports] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDailySales()
  }, [selectedDate])

  useEffect(() => {
    fetchMonthlySales()
  }, [selectedYear, selectedMonth])

  const fetchDailySales = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/orders/sales/daily?date=${selectedDate}`)
      setDailyReport(response.data)
    } catch (error) {
      console.error('Error fetching daily sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlySales = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/orders/sales/monthly?year=${selectedYear}&month=${selectedMonth}`)
      setMonthlyReports(response.data)
    } catch (error) {
      console.error('Error fetching monthly sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    return months[month - 1]
  }

  const getMonthlyTotal = () => {
    return monthlyReports.reduce((sum, report) => ({
      totalOrders: sum.totalOrders + report.totalOrders,
      totalRevenue: sum.totalRevenue + report.totalRevenue,
      cashSales: sum.cashSales + report.cashSales,
      cardSales: sum.cardSales + report.cardSales,
      qrSales: sum.qrSales + report.qrSales,
      onlineSales: sum.onlineSales + report.onlineSales
    }), {
      totalOrders: 0,
      totalRevenue: 0,
      cashSales: 0,
      cardSales: 0,
      qrSales: 0,
      onlineSales: 0
    })
  }

  const monthlyTotal = getMonthlyTotal()

  return (
    <div className="sales-reports-container">
      <h1>Sales Reports</h1>

      <div className="reports-grid">
        <div className="daily-report">
          <h2>Daily Sales Report</h2>
          <div className="date-selector">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : dailyReport ? (
            <div className="report-card">
              <div className="report-header">
                <h3>{new Date(dailyReport.date).toLocaleDateString()}</h3>
              </div>
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Orders:</span>
                  <span className="stat-value">{dailyReport.totalOrders}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Revenue:</span>
                  <span className="stat-value revenue">${dailyReport.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cash Sales:</span>
                  <span className="stat-value">${dailyReport.cashSales.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Card Sales:</span>
                  <span className="stat-value">${dailyReport.cardSales.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">QR Code Sales:</span>
                  <span className="stat-value">${dailyReport.qrSales.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Online Sales:</span>
                  <span className="stat-value">${dailyReport.onlineSales.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">No sales data for this date</div>
          )}
        </div>

        <div className="monthly-report">
          <h2>Monthly Sales Report</h2>
          <div className="date-selector">
            <label>Select Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : monthlyReports.length > 0 ? (
            <>
              <div className="monthly-summary">
                <h3>Summary for {getMonthName(selectedMonth)} {selectedYear}</h3>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Orders:</span>
                    <span className="stat-value">{monthlyTotal.totalOrders}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Revenue:</span>
                    <span className="stat-value revenue">${monthlyTotal.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Cash Sales:</span>
                    <span className="stat-value">${monthlyTotal.cashSales.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Card Sales:</span>
                    <span className="stat-value">${monthlyTotal.cardSales.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">QR Code Sales:</span>
                    <span className="stat-value">${monthlyTotal.qrSales.toFixed(2)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Online Sales:</span>
                    <span className="stat-value">${monthlyTotal.onlineSales.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="daily-breakdown">
                <h3>Daily Breakdown</h3>
                <div className="breakdown-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Cash</th>
                        <th>Card</th>
                        <th>QR</th>
                        <th>Online</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReports.map(report => (
                        <tr key={report.date}>
                          <td>{new Date(report.date).toLocaleDateString()}</td>
                          <td>{report.totalOrders}</td>
                          <td>${report.totalRevenue.toFixed(2)}</td>
                          <td>${report.cashSales.toFixed(2)}</td>
                          <td>${report.cardSales.toFixed(2)}</td>
                          <td>${report.qrSales.toFixed(2)}</td>
                          <td>${report.onlineSales.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data">No sales data for this month</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SalesReports

