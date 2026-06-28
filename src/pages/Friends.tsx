import React, { useState, useEffect } from 'react'
import { UserPlus, Users, Search, Check, X, MessageCircle, UserMinus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Link } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'

type Profile = Database['public']['Tables']['profiles']['Row']
type Friendship = Database['public']['Tables']['friendships']['Row'] & {
  sender: Database['public']['Tables']['profiles']['Row'] | null
  receiver: Database['public']['Tables']['profiles']['Row'] | null
}

const Friends: React.FC = () => {
  const { user } = useAuth()
  const { 
    friendships, 
    sendFriendRequest, 
    respondToFriendRequest, 
    removeFriend,
    refreshData 
  } = useChat()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends')

  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  useEffect(() => {
    if (debouncedSearchTerm.trim() && activeTab === 'search') {
      searchUsers()
    }
  }, [debouncedSearchTerm, activeTab])

  const searchUsers = async () => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user?.id || '')
        .or(`username.ilike.%${debouncedSearchTerm}%,full_name.ilike.%${debouncedSearchTerm}%`)
        .limit(20)

      if (error) {
        console.error('Error searching users:', error)
      } else {
        setSearchResults(data)
      }
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendFriendRequest = async (receiverId: string) => {
    try {
      await sendFriendRequest(receiverId)
      await refreshData()
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  const handleFriendRequestResponse = async (friendshipId: string, status: 'accepted' | 'rejected') => {
    try {
      await respondToFriendRequest(friendshipId, status)
      await refreshData()
    } catch (error) {
      console.error('Error responding to friend request:', error)
    }
  }

  const handleRemoveFriend = async (friendshipId: string) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return
    }

    try {
      await removeFriend(friendshipId)
      await refreshData()
    } catch (error) {
      console.error('Error removing friend:', error)
    }
  }

  const getRelationshipStatus = (profile: Profile) => {
    const friendship = friendships.find(f => 
      (f.sender_id === user?.id && f.receiver_id === profile.id) ||
      (f.receiver_id === user?.id && f.sender_id === profile.id)
    )

    if (!friendship) return 'none'
    
    if (friendship.status === 'accepted') return 'friends'
    if (friendship.status === 'pending') {
      return friendship.sender_id === user?.id ? 'sent' : 'received'
    }
    return 'none'
  }

  const acceptedFriends = friendships.filter(f => f.status === 'accepted')
  const pendingRequests = friendships.filter(f => 
    f.status === 'pending' && f.receiver_id === user?.id
  )
  const sentRequests = friendships.filter(f => 
    f.status === 'pending' && f.sender_id === user?.id
  )

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 text-center">
          <Users className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to connect with friends
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join the developer community and start making connections
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Friends</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Connect with other developers and start chatting
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('friends')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'friends'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends ({acceptedFriends.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Requests ({pendingRequests.length})
                {pendingRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Friends
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'friends' && (
        <div>
          {acceptedFriends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {acceptedFriends.map(friendship => {
                const friend = friendship.sender_id === user?.id 
                  ? friendship.receiver 
                  : friendship.sender

                if (!friend) return null

                return (
                  <div
                    key={friendship.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {friend.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {friend.full_name || friend.username}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">@{friend.username}</p>
                      </div>
                    </div>

                    {friend.bio && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {friend.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/chat/${friend.id}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat
                      </Link>
                      <button
                        onClick={() => handleRemoveFriend(friendship.id)}
                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        title="Remove friend"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Friends since {formatDistanceToNow(new Date(friendship.created_at), { addSuffix: true })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No friends yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Start by searching for other developers to connect with
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Find Friends
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Pending Requests (Received) */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map(friendship => {
                  const sender = friendship.sender_profile

                  return (
                    <div
                      key={friendship.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {sender.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {sender.full_name || sender.username}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">@{sender.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFriendRequestResponse(friendship.id, 'accepted')}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleFriendRequestResponse(friendship.id, 'rejected')}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Sent {formatDistanceToNow(new Date(friendship.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Sent Requests ({sentRequests.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sentRequests.map(friendship => {
                  const receiver = friendship.receiver

                  if (!receiver) return null

                  return (
                    <div
                      key={friendship.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {receiver.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {receiver.full_name || receiver.username}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">@{receiver.username}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Sent {formatDistanceToNow(new Date(friendship.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {pendingRequests.length === 0 && sentRequests.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
              <p className="text-gray-500 dark:text-gray-400">
                All your friend requests have been handled
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users by username or name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
                ))}
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map(profile => {
                const relationshipStatus = getRelationshipStatus(profile)

                return (
                  <div
                    key={profile.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {profile.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {profile.full_name || profile.username}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${profile.username}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        View Profile
                      </Link>

                      {relationshipStatus === 'none' && (
                        <button
                          onClick={() => handleSendFriendRequest(profile.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Friend
                        </button>
                      )}

                      {relationshipStatus === 'sent' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Pending
                        </span>
                      )}

                      {relationshipStatus === 'friends' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          Friends
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : searchTerm.trim() ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try searching with different keywords
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Search for friends</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Enter a username or name to find other developers
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Friends  