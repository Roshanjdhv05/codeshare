import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Send, ArrowLeft, Users, MessageCircle, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Database } from '../lib/database.types'

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender_profile: Database['public']['Tables']['profiles']['Row']
  receiver_profile: Database['public']['Tables']['profiles']['Row']
}

const Chat: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>()
  const { user } = useAuth()
  const { 
    chatParticipants, 
    sendMessage, 
    fetchChatHistory, 
    fetchChatParticipants,
    markNotificationAsRead,
    notifications
  } = useChat()
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChatParticipants()
  }, [])

  useEffect(() => {
    if (friendId) {
      const friend = chatParticipants.find(p => p.friend_id === friendId)
      console.log('Looking for friend:', friendId, 'in participants:', chatParticipants)
      if (friend) {
        setSelectedFriend(friend)
        loadChatHistory(friendId)
        markChatNotificationsAsRead(friendId)
      } else {
        console.log('Friend not found in participants')
      }
    }
  }, [friendId, chatParticipants])

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  const loadChatHistory = async (friendId: string) => {
    setLoading(true)
    try {
      const history = await fetchChatHistory(friendId)
      setChatHistory(history)
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setLoading(false)
    }
  }

  const markChatNotificationsAsRead = async (friendId: string) => {
    const unreadMessageNotifications = notifications.filter(n => 
      n.type === 'message' && !n.is_read
    )

    for (const notification of unreadMessageNotifications) {
      const relatedMessage = chatHistory.find(m => m.id === notification.reference_id)
      if (relatedMessage && relatedMessage.sender_id === friendId) {
        await markNotificationAsRead(notification.id)
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFriend || !newMessage.trim()) return

    try {
      await sendMessage(selectedFriend.friend_id, newMessage)
      setNewMessage('')
      // Refresh chat history
      await loadChatHistory(selectedFriend.friend_id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredParticipants = chatParticipants.filter(participant =>
    participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
        <div className="flex h-full">
          {/* Friends Sidebar */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chats</h2>
                <Link
                  to="/friends"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <Users className="h-5 w-5" />
                </Link>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto">
              {filteredParticipants.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredParticipants.map(participant => (
                    <Link
                      key={participant.friend_id}
                      to={`/chat/${participant.friend_id}`}
                      className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                        selectedFriend?.friend_id === participant.friend_id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {participant.username[0].toUpperCase()}
                            </span>
                          </div>
                          {participant.unread_count > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {participant.unread_count > 9 ? '9+' : participant.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {participant.full_name || participant.username}
                            </p>
                            {participant.last_message_time && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(participant.last_message_time))}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {participant.last_message_content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No friends found' : 'No friends to chat with'}
                  </p>
                  {!searchTerm && (
                    <Link
                      to="/friends"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-2 inline-block"
                    >
                      Add friends to start chatting
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedFriend ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    <Link
                      to="/chat"
                      className="md:hidden p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Link>
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {selectedFriend.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedFriend.full_name || selectedFriend.username}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{selectedFriend.username}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
                >
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : chatHistory.length > 0 ? (
                    <>
                      {chatHistory.map(message => {
                        const isOwnMessage = message.sender_id === user?.id

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage 
                                  ? 'text-blue-100' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Start the conversation with {selectedFriend.username}
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedFriend.username}...`}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Chat Selected */
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Select a friend to start chatting
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Choose a conversation from the sidebar or start a new one
                  </p>
                  {chatParticipants.length === 0 && (
                    <Link
                      to="/friends"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Find Friends
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat   