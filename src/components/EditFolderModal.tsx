import React, { useState } from 'react'
import { X, Save, AlertCircle, Folder, Tag, Globe, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'

type UserFolder = Database['public']['Tables']['user_folders']['Row']

interface EditFolderModalProps {
  folder: UserFolder
  onClose: () => void
  onSuccess: () => void
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
  folder,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    folder_name: folder.folder_name,
    description: folder.description || '',
    tags: folder.tags.join(', '),
    is_public: folder.is_public,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to edit a folder')
      return
    }

    if (!formData.folder_name.trim()) {
      setError('Folder name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { data, error } = await supabase
        .from('user_folders')
        .update({
          folder_name: formData.folder_name.trim(),
          description: formData.description.trim(),
          tags: tagsArray,
          is_public: formData.is_public,
        })
        .eq('id', folder.id)
        .eq('user_id', user.id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error updating folder:', error)
      setError(error.message || 'An error occurred while updating the folder')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg border border-gray-700/30 rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100/20 rounded-full flex items-center justify-center">
              <Folder className="h-4 w-4 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Edit Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)] space-y-6 text-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/20 border border-red-200/40 rounded-md p-4 text-white">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="folder_name" className="block text-sm font-medium mb-1">Folder Name *</label>
              <input
                type="text"
                id="folder_name"
                name="folder_name"
                required
                className="w-full px-3 py-2 border border-gray-600 bg-white/10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                value={formData.folder_name}
                onChange={handleChange}
                placeholder="e.g., Portfolio Site, DSA Snippets"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-600 bg-white/10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this folder contains"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">Tags</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="w-full pl-10 pr-3 py-2 border border-gray-600 bg-white/10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="react, javascript, frontend (comma-separated)"
                />
              </div>
              <p className="text-xs text-gray-300 mt-1">Add tags separated by commas to help organize your folders</p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm flex items-center gap-2">
                  {formData.is_public ? (
                    <>
                      <Globe className="h-4 w-4 text-green-400" />
                      Make this folder public
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-gray-400" />
                      Keep this folder private
                    </>
                  )}
                </span>
              </label>
              <p className="text-xs text-gray-300 mt-1">
                Public folders will be visible on your profile. Private folders are only visible to you.
              </p>
            </div>

            <div className="bg-white/10 border border-gray-700/30 rounded-md p-4">
              <div className="flex gap-3">
                <Folder className="h-5 w-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-medium text-white">Privacy Settings</h3>
                  <ul className="list-disc list-inside mt-2 text-xs text-gray-300 space-y-1">
                    <li>Public folders appear on your profile for others to see</li>
                    <li>Private folders are only visible to you</li>
                    <li>You can change this setting anytime</li>
                    <li>Files inside follow the folder's privacy setting</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-700/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/80 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.folder_name.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600/70 hover:bg-blue-700/80 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditFolderModal
