import { useState, useCallback } from 'react'

interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  action?: 'saved' | 'unsaved'
  duration?: number
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const showToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'info' = 'info',
    action?: 'saved' | 'unsaved',
    duration?: number
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = { id, message, type, action, duration }
    
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    removeToast
  }
}