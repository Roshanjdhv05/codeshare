import React, { useState, useEffect } from 'react'
import { Plus, Users, Calendar, Search, Copy, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Link } from 'react-router-dom'
import CreateRoomModal from './CreateRoomModal'
import JoinRoomModal from './JoinRoomModal'

type CodeRoom = Database['public']['Tables']['coderooms']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
  is_admin: boolean
}

const CodeRooms: React.FC = () => {
  const { user } = useAuth()
  const [rooms, setRooms] = useState<CodeRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchUserRooms()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserRooms = async () => {
    if (!user) return

    try {
      setError('')
      const { data: memberData, error: memberError } = await supabase
        .from('coderoom_members')
        .select('coderoom_id')
        .eq('user_id', user.id)

      if (memberError) {
        console.error('Error fetching member data:', memberError)
        setError('Failed to fetch your rooms. Please try again.')
        return
      }

      console.log('Member data:', memberData)

      if (!memberData || memberData.length === 0) {
        setRooms([])
        setLoading(false)
        return
      }

      const roomIds = memberData.map(m => m.coderoom_id)
      console.log('Room IDs:', roomIds)

      const { data: roomsData, error: roomsError } = await supabase
        .from('coderooms')
        .select(`
          id,
          title,
          description,
          admin_id,
          room_code,
          created_at
        `)
        .in('id', roomIds)

      if (roomsError) {
        console.error('Error fetching rooms data:', roomsError)
        setError('Failed to fetch room details. Please try again.')
        return
      }

      console.log('Rooms data:', roomsData)

      const adminIds = roomsData?.map(room => room.admin_id) || []
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', adminIds)

      if (profilesError) {
        console.error('Error fetching profiles data:', profilesError)
        setError('Failed to fetch admin profiles. Please try again.')
        return
      }

      console.log('Profiles data:', profilesData)

      const { data: memberCounts, error: countError } = await supabase
        .from('coderoom_members')
        .select('coderoom_id')
        .in('coderoom_id', roomIds)

      if (countError) {
        console.error('Error fetching member counts:', countError)
      }

      console.log('Member counts:', memberCounts)

      const processedRooms: CodeRoom[] = roomsData?.map(room => {
        const adminProfile = profilesData?.find(p => p.id === room.admin_id)
        const memberCount = memberCounts?.filter(mc => mc.coderoom_id === room.id).length || 0
        
        return {
          ...room,
          profiles: adminProfile || {
            id: room.admin_id,
            username: 'Unknown',
            full_name: '',
            avatar_url: ''
          },
          member_count: memberCount,
          is_admin: room.admin_id === user.id
        }
      }) || []

      setRooms(processedRooms)
    } catch (error) {
      console.error('Error fetching user rooms:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoomCreated = () => {
    setShowCreateModal(false)
    fetchUserRooms()
  }

  const handleRoomJoined = () => {
    setShowJoinModal(false)
    fetchUserRooms()
  }

  const copyRoomCode = async (roomCode: string) => {
    try {
      await navigator.clipboard.writeText(roomCode)
      setCopiedCode(roomCode)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      console.error('Failed to copy room code:', error)
      setError('Failed to copy room code.')
    }
  }

  const filteredRooms = rooms.filter(room =>
    room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please Sign In</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view your CodeRooms.</p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => {
              setError('')
              fetchUserRooms()
            }}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CodeRooms</h1>
            <p className="mt-2 text-gray-600">
              Collaborate on code with your team in real-time
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Room
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </button>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map(room => (
            <Link
              key={room.id}
              to={`/coderooms/${room.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {room.title}
                    </h3>
                    {room.is_admin && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      copyRoomCode(room.room_code)
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    title="Copy room code"
                  >
                    {copiedCode === room.room_code ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span className="font-mono">{room.room_code}</span>
                  </button>
                </div>
                {room.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {room.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {room.profiles.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span>Created by {room.profiles.username}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No CodeRooms yet</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ? 'No rooms match your search.' : 'Create your first room or join an existing one to get started.'}
          </p>
          {!searchTerm && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Join Room
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </button>
            </div>
          )}
        </div>
      )}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRoomCreated}
        />
      )}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={handleRoomJoined}
        />
      )}
    </div>
  )
}

export default CodeRooms