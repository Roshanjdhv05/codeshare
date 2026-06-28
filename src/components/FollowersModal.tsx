import React from 'react'
import { X, UserMinus, Users } from 'lucide-react'
import { Database } from '../lib/database.types'
import { Link } from 'react-router-dom'

type UserFollower = Database['public']['Tables']['user_followers']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

interface FollowersModalProps {
  type: 'followers' | 'following'
  followers: UserFollower[]
  onClose: () => void
  onUnfollow: (userId: string) => void
  onRemoveFollower: (userId: string) => void
  currentUserId: string
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  type,
  followers,
  onClose,
  onUnfollow,
  onRemoveFollower,
  currentUserId,
}) => {
  const title = type === 'followers' ? 'Followers' : 'Following'
  const emptyMessage = type === 'followers' 
    ? 'No followers yet' 
    : 'Not following anyone yet'

  const handleAction = (userId: string) => {
    if (type === 'followers') {
      onRemoveFollower(userId)
    } else {
      onUnfollow(userId)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-5rem)]">
          {followers.length > 0 ? (
            <div className="p-6 space-y-4">
              {followers.map(follower => {
                const profile = follower.profiles
                const userId = type === 'followers' ? follower.follower_id : follower.following_id
                
                return (
                  <div key={follower.id} className="flex items-center justify-between">
                    <Link
                      to={`/profile/${profile.username}`}
                      className="flex items-center gap-3 flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                      onClick={onClose}
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {profile.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {profile.full_name || profile.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{profile.username}
                        </p>
                      </div>
                    </Link>
                    
                    <button
                      onClick={() => handleAction(userId)}
                      className="inline-flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title={type === 'followers' ? 'Remove follower' : 'Unfollow'}
                    >
                      <UserMinus className="h-3 w-3 mr-1" />
                      {type === 'followers' ? 'Remove' : 'Unfollow'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
              <p className="text-gray-500 text-sm">
                {type === 'followers' 
                  ? 'Share your profile to get followers!'
                  : 'Start following other developers to see their content.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FollowersModal