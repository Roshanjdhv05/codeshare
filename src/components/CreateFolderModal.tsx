import React, { useState } from 'react'
import { X, Save, AlertCircle, Folder, Tag } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface CreateFolderModalProps {
  onClose: () => void
  onSuccess: () => void
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    folder_name: '',
    description: '',
    tags: '',
    is_public: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a folder')
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
        .insert([
          {
            user_id: user.id,
            folder_name: formData.folder_name.trim(),
            description: formData.description.trim(),
            tags: tagsArray,
            is_public: formData.is_public,
          },
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
      } else {
        console.log('Folder created successfully:', data)
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating folder:', error)
      setError(error.message || 'An error occurred while creating the folder')
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Folder</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="folder_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Folder Name *
              </label>
              <input
                type="text"
                id="folder_name"
                name="folder_name"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={formData.folder_name}
                onChange={handleChange}
                placeholder="e.g., Portfolio Site, DSA Snippets"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this folder contains"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="react, javascript, frontend (comma-separated)"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Add tags separated by commas to help organize your folders
              </p>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Make this folder public</span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Public folders will be visible on your public profile. Private folders are only visible to you.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Folder className="h-5 w-5 text-blue-400 dark:text-blue-300" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Folder Features
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Add multiple code files with different extensions</li>
                      <li>Edit files with syntax highlighting</li>
                      <li>Preview HTML files in browser</li>
                      <li>Download individual files or entire folder</li>
                      <li>Search through file contents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.folder_name.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-md hover:bg-blue-700 dark:hover:bg-blue-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateFolderModal