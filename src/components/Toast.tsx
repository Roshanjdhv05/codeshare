import React, { useEffect, useState } from 'react'
import { Check, X, Bookmark, BookmarkX } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  action?: 'saved' | 'unsaved'
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  action,
  onClose, 
  duration = 3000 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    if (action === 'saved') return <Bookmark className="h-4 w-4" />
    if (action === 'unsaved') return <BookmarkX className="h-4 w-4" />
    if (type === 'success') return <Check className="h-4 w-4" />
    if (type === 'error') return <X className="h-4 w-4" />
    return null
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'info':
      default:
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${getStyles()}`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="ml-2 hover:bg-white/20 rounded p-1 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export default Toast