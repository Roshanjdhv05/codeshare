import React from 'react'
import { useChat } from '../contexts/ChatContext'

interface OnlineStatusProps {
  userId: string
  className?: string
}

const OnlineStatus: React.FC<OnlineStatusProps> = ({ userId, className = '' }) => {
  const { isConnected } = useChat()
  
  // In a real implementation, you'd track individual user online status
  // For demo purposes, we'll show the current user's connection status
  const isOnline = isConnected

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}
        title={isOnline ? 'Online' : 'Offline'}
      />
      {isOnline && (
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
      )}
    </div>
  )
}

export default OnlineStatus