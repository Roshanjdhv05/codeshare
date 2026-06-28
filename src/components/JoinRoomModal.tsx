import React, { useState } from 'react'
import { X, Users, AlertCircle, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface JoinRoomModalProps {
  onClose: () => void
  onSuccess: () => void
}

const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to join a room')
      return
    }

    if (!roomCode.trim()) {
      setError('Please enter a room code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // First, check if the room exists
      const { data: roomData, error: roomError } = await supabase
        .from('coderooms')
        .select('id, title')
        .eq('room_code', roomCode.toUpperCase())
        .single()

      if (roomError || !roomData) {
        setError('Invalid room code. Please check and try again.')
        setLoading(false)
        return
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('coderoom_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('coderoom_id', roomData.id)
        .single()

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        console.error('Error checking membership:', memberCheckError)
        setError('An error occurred while checking membership')
        setLoading(false)
        return
      }

      if (existingMember) {
        setError('You are already a member of this room')
        setLoading(false)
        return
      }

      // Join the room
      const { error: joinError } = await supabase
        .from('coderoom_members')
        .insert([
          {
            user_id: user.id,
            coderoom_id: roomData.id,
          },
        ])

      if (joinError) {
        console.error('Error joining room:', joinError)
        setError(joinError.message)
      } else {
        console.log('Successfully joined room:', roomData.title)
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error joining room:', error)
      setError(error.message || 'An error occurred while joining the room')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 8 characters
    const value = e.target.value.toUpperCase().slice(0, 8)
    setRoomCode(value)
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Join CodeRoom</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
                Room Code *
              </label>
              <input
                type="text"
                id="roomCode"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-lg text-center tracking-wider"
                value={roomCode}
                onChange={handleCodeChange}
                placeholder="ABC123"
                maxLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-8 character room code shared by the room admin
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    What happens when you join?
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>You'll become a member of the room</li>
                      <li>View all posts shared by the admin</li>
                      <li>Comment on posts in real-time</li>
                      <li>Receive notifications for new content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !roomCode.trim()}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default JoinRoomModal