import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, MessageCircle, Bell, Copy, Check, Settings } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import CreatePostModal from '../components/CreatePostModal'
import PostCard from '../components/PostCard'

type CodeRoom = Database['public']['Tables']['coderooms']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
  is_admin: boolean
}

type CodeRoomPost = Database['public']['Tables']['coderoom_posts']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  comment_count: number
}

type CodeRoomMember = Database['public']['Tables']['coderoom_members']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

const CodeRoomDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [room, setRoom] = useState<CodeRoom | null>(null)
  const [posts, setPosts] = useState<CodeRoomPost[]>([])
  const [members, setMembers] = useState<CodeRoomMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [notifications, setNotifications] = useState<number>(0)

  useEffect(() => {
    if (roomId && user) {
      fetchRoomData()
      fetchPosts()
      fetchMembers()
      setupRealtimeSubscriptions()
    }
  }, [roomId, user])

  const fetchRoomData = async () => {
    if (!roomId || !user) return

    try {
      // Get room details
      const { data: roomData, error: roomError } = await supabase
        .from('coderooms')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('id', roomId)
        .single()

      if (roomError) {
        console.error('Error fetching room:', roomError)
        navigate('/coderooms')
        return
      }

      // Check if user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('coderoom_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('coderoom_id', roomId)
        .single()

      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error checking membership:', memberError)
        navigate('/coderooms')
        return
      }

      if (!memberData && roomData.admin_id !== user.id) {
        console.error('User is not a member of this room')
        navigate('/coderooms')
        return
      }

      // Get member count
      const { data: memberCount, error: countError } = await supabase
        .from('coderoom_members')
        .select('id')
        .eq('coderoom_id', roomId)

      if (countError) {
        console.error('Error fetching member count:', countError)
      }

      setRoom({
        ...roomData,
        member_count: memberCount?.length || 0,
        is_admin: roomData.admin_id === user.id
      })
    } catch (error) {
      console.error('Error fetching room data:', error)
      navigate('/coderooms')
    }
  }

  const fetchPosts = async () => {
    if (!roomId) return

    try {
      const { data, error } = await supabase
        .from('coderoom_posts')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('coderoom_id', roomId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        return
      }

      // Get comment counts for each post
      const postIds = data.map(post => post.id)
      const { data: commentCounts, error: commentError } = await supabase
        .from('coderoom_comments')
        .select('post_id')
        .in('post_id', postIds)

      if (commentError) {
        console.error('Error fetching comment counts:', commentError)
      }

      const postsWithCounts = data.map(post => ({
        ...post,
        comment_count: commentCounts?.filter(c => c.post_id === post.id).length || 0
      }))

      setPosts(postsWithCounts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    if (!roomId) return

    try {
      const { data, error } = await supabase
        .from('coderoom_members')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('coderoom_id', roomId)
        .order('joined_at', { ascending: true })

      if (error) {
        console.error('Error fetching members:', error)
        return
      }

      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const setupRealtimeSubscriptions = () => {
    if (!roomId) return

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel(`room-posts-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coderoom_posts',
          filter: `coderoom_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New post:', payload)
          fetchPosts()
          setNotifications(prev => prev + 1)
        }
      )
      .subscribe()

    // Subscribe to new comments
    const commentsSubscription = supabase
      .channel(`room-comments-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coderoom_comments'
        },
        (payload) => {
          console.log('New comment:', payload)
          fetchPosts() // Refresh to update comment counts
          setNotifications(prev => prev + 1)
        }
      )
      .subscribe()

    // Subscribe to new members
    const membersSubscription = supabase
      .channel(`room-members-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'coderoom_members',
          filter: `coderoom_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New member:', payload)
          fetchMembers()
          fetchRoomData() // Refresh member count
        }
      )
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      postsSubscription.unsubscribe()
      commentsSubscription.unsubscribe()
      membersSubscription.unsubscribe()
    }
  }

  const handlePostCreated = () => {
    setShowCreatePost(false)
    fetchPosts()
  }

  const copyRoomCode = async () => {
    if (!room) return
    
    try {
      await navigator.clipboard.writeText(room.room_code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (error) {
      console.error('Failed to copy room code:', error)
    }
  }

  const clearNotifications = () => {
    setNotifications(0)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Room not found</h2>
          <p className="mt-2 text-gray-600">The room you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate('/coderooms')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/coderooms')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{room.title}</h1>
            {room.description && (
              <p className="mt-1 text-gray-600">{room.description}</p>
            )}
          </div>
          {notifications > 0 && (
            <button
              onClick={clearNotifications}
              className="relative p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications}
              </span>
            </button>
          )}
        </div>

        {/* Room Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {room.profiles.username[0].toUpperCase()}
              </span>
            </div>
            <span>Admin: {room.profiles.username}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{room.member_count} members</span>
          </div>
          <button
            onClick={copyRoomCode}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            {copiedCode ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span className="font-mono">{room.room_code}</span>
          </button>
          {room.is_admin && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              You are admin
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Actions */}
          {room.is_admin && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreatePost(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </button>
            </div>
          )}

          {/* Posts */}
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={room.is_admin}
                  currentUserId={user?.id || ''}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500 mb-6">
                  {room.is_admin 
                    ? 'Create your first post to start sharing code with your team.'
                    : 'The admin hasn\'t shared any posts yet.'}
                </p>
                {room.is_admin && (
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Members ({room.member_count})
            </h3>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {member.profiles.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.profiles.username}
                      {member.user_id === room.admin_id && (
                        <span className="ml-1 text-xs text-blue-600">(Admin)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && room && (
        <CreatePostModal
          room={room}
          onClose={() => setShowCreatePost(false)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  )
}

export default CodeRoomDetail