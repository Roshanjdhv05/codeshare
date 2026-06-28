import { useEffect, useRef } from 'react'
import { socketService } from '../lib/socket'
import { useAuth } from '../contexts/AuthContext'

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(socketService)

  useEffect(() => {
    const socket = socketRef.current

    if (user) {
      // Connect and identify user
      socket.connect()

      socket.emit('identify', { userId: user.id })

      socket.on('connect', () => {
        console.log('🟢 Socket connected:', socket.id)
      })

      socket.on('disconnect', () => {
        console.log('🔴 Socket disconnected')
      })
    } else {
      socket.disconnect()
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.disconnect()
    }
  }, [user])

  return socketRef.current
}
