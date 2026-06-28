import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastData {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  action?: 'saved' | 'unsaved'
  duration?: number
}

interface ToastContextType {
  toasts: ToastData[]
  showToast: (message: string, type?: 'success' | 'error' | 'info', action?: 'saved' | 'unsaved', duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  const value = {
    toasts,
    showToast,
    removeToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}