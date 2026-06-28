import React from 'react'
import { Check, X, User } from 'lucide-react'
import { Database } from '../lib/database.types'
import { formatDistanceToNow } from '../utils/dateUtils'

type Friendship = Database['public']['Tables']['friendships']['Row'] & {
  sender_profile: Database['public']['Tables']['profiles']['Row']
  receiver_profile: Database['public']['Tables']['profiles']['Row']
}

interface FriendRequestCardProps {
  friendship: Friendship
  onAccept: (friendshipId: string) => void
  onReject: (friendshipId: string) => void
  type: 'received' | 'sent'
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  friendship,
  onAccept,
  onReject,
  type
}) => {
  const profile = type === 'received' ? friendship.sender : friendship.receiver

  if (!profile) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300 p-6">
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

      {type === 'received' ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(friendship.id)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </button>
          <button
            onClick={() => onReject(friendship.id)}
            className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            <User className="h-4 w-4 mr-1" />
            Pending
          </span>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        {type === 'received' ? 'Received' : 'Sent'} {formatDistanceToNow(new Date(friendship.created_at), { addSuffix: true })}
      </div>
    </div>
  )
}

export default FriendRequestCard  