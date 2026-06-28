import { Database } from '../lib/database.types'

type Message = Database['public']['Tables']['messages']['Row']

export const groupMessagesByDate = (messages: Message[]) => {
  const groups: { [key: string]: Message[] } = {}
  
  messages.forEach(message => {
    const date = new Date(message.created_at).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
  })
  
  return groups
}

export const isToday = (date: Date): boolean => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export const formatChatDate = (date: Date): string => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return date.toLocaleDateString()
}

export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const getLastSeenText = (lastSeen: Date): string => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Active now'
  if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Active ${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `Active ${diffInDays}d ago`
}