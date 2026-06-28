import React, { useState } from 'react'
import { X, Save, AlertCircle, Code2, Image as ImageIcon, Video, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import CodeBlock from './CodeBlock'

type CodeRoom = Database['public']['Tables']['coderooms']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  member_count: number
  is_admin: boolean
}

interface CreatePostModalProps {
  room: CodeRoom
  onClose: () => void
  onSuccess: () => void
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  room,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    media_url: '',
    media_type: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a post')
      return
    }

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.content.trim() && !formData.media_url.trim()) {
      setError('Either content or media is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('coderoom_posts')
        .insert([
          {
            coderoom_id: room.id,
            admin_id: user.id,
            title: formData.title,
            content: formData.content,
            media_url: formData.media_url,
            media_type: formData.media_type,
          },
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        console.log('Post created successfully:', data)
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'An error occurred while creating the post')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const detectMediaType = (url: string): string => {
    if (!url) return ''
    
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
    
    const lowerUrl = url.toLowerCase()
    
    if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'image'
    }
    
    if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
      return 'video'
    }
    
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || 
        lowerUrl.includes('vimeo.com') || lowerUrl.includes('twitch.tv')) {
      return 'video'
    }
    
    return 'image'
  }

  const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      media_url: url,
      media_type: detectMediaType(url)
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Create New Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-300" />
                  <div className="ml-3">
                    <p className="text-sm text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter post title"
                  />
                </div>

                {/* Media Section */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-white mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2 text-gray-300" />
                    Media (Optional)
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="media_url" className="block text-sm font-medium text-gray-300 mb-1">
                        Image or Video URL
                      </label>
                      <input
                        type="url"
                        id="media_url"
                        name="media_url"
                        className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                        value={formData.media_url}
                        onChange={handleMediaUrlChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Add an image or video to showcase your code's output
                      </p>
                    </div>

                    {formData.media_url && (
                      <div>
                        <label htmlFor="media_type" className="block text-sm font-medium text-gray-300 mb-1">
                          Media Type
                        </label>
                        <select
                          id="media_type"
                          name="media_type"
                          className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-700 text-white"
                          value={formData.media_type}
                          onChange={handleChange}
                        >
                          <option value="">Auto-detect</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    )}

                    {/* Media Preview */}
                    {formData.media_url && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                        <div className="relative rounded-lg overflow-hidden bg-gray-600 max-w-sm">
                          {formData.media_type === 'video' ? (
                            <video
                              src={formData.media_url}
                              className="w-full h-32 object-cover"
                              controls
                              onError={(e) => {
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex items-center justify-center h-32 bg-gray-500 text-gray-400">
                                      <div class="text-center">
                                        <svg class="mx-auto h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <p class="mt-1 text-xs">Invalid video URL</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          ) : (
                            <img
                              src={formData.media_url}
                              alt="Preview"
                              className="w-full h-32 object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="flex items-center justify-center h-32 bg-gray-500 text-gray-400">
                                      <div class="text-center">
                                        <svg class="mx-auto h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p class="mt-1 text-xs">Invalid image URL</p>
                                      </div>
                                    </div>
                                  `;
                                }
                              }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Code */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                    Code Content
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <div className="min-h-64">
                    <CodeBlock
                      code={formData.content || '// No content yet'}
                      language="javascript"
                      showCopyButton={false}
                    />
                  </div>
                ) : (
                  <textarea
                    id="content"
                    name="content"
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm bg-gray-800 text-white"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Paste your code here..."
                  />
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-700 bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim() || (!formData.content.trim() && !formData.media_url.trim())}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePostModal