import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    setToast({
      show: true,
      message,
      type,
      duration
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }))
  }, [])

  const showSuccess = useCallback((message, duration) => {
    showToast(message, 'success', duration)
  }, [showToast])

  const showError = useCallback((message, duration) => {
    showToast(message, 'error', duration)
  }, [showToast])

  const showInfo = useCallback((message, duration) => {
    showToast(message, 'info', duration)
  }, [showToast])

  const showWarning = useCallback((message, duration) => {
    showToast(message, 'warning', duration)
  }, [showToast])

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

