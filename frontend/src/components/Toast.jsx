import { useEffect } from 'react'
import './Toast.css'

const Toast = ({ show, message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'info':
        return 'ℹ'
      case 'warning':
        return '⚠'
      default:
        return '✓'
    }
  }

  return (
    <div className={`toast toast-${type} ${show ? 'toast-show' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">{getIcon()}</div>
        <div className="toast-message">{message}</div>
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms` }}></div>
      </div>
    </div>
  )
}

export default Toast

