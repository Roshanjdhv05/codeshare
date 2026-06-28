import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, UserPlus, MessageCircle, CheckCheck } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Link } from 'react-router-dom'

const NotificationsDropdown: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    respondToFriendRequest,
    friendships
  } = useChat()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
    }
    setIsOpen(false)
  }

  const handleFriendRequestResponse = async (friendshipId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToFriendRequest(friendshipId, status)
      // Mark related notification as read
      const relatedNotification = notifications.find(n => n.reference_id === friendshipId)
      if (relatedNotification && !relatedNotification.is_read) {
        await markNotificationAsRead(relatedNotification.id)
      }
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  const getNotificationContent = (notification: any) => {
    if (notification.type === 'friend_request') {
      const friendship = friendships.find(f => f.id === notification.reference_id)
      if (friendship) {
        const sender = friendship.sender_profile
        return {
          icon: <UserPlus className="h-4 w-4 text-blue-500" />,
          title: 'Friend Request',
          message: `${sender.username} sent you a friend request`,
          actions: friendship.status === 'pending' ? (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFriendRequestResponse(friendship.id, 'accepted')
                }}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleFriendRequestResponse(friendship.id, 'rejected')
                }}
                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
              >
                Decline
              </button>
            </div>
          ) : null
        }
      }
    } else if (notification.type === 'message') {
      return {
        icon: <MessageCircle className="h-4 w-4 text-green-500" />,
        title: 'New Message',
        message: 'You have a new message',
        link: '/chat'
      }
    }

    return {
      icon: <Bell className="h-4 w-4 text-gray-500" />,
      title: 'Notification',
      message: 'You have a new notification'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 dark:text-blue-300 dark:hover:bg-coder-surface/50 rounded-md transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.slice(0, 10).map(notification => {
                  const content = getNotificationContent(notification)
                  const Component = content.link ? Link : 'div'
                  const componentProps = content.link ? { to: content.link } : {}

                  return (
                    <Component
                      key={notification.id}
                      {...componentProps}
                      className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {content.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {content.title}
                            </p>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {content.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                          {content.actions}
                        </div>
                      </div>
                    </Component>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationsDropdown