import React, { useState } from 'react'
import { X, Save, AlertCircle, Upload, Image as ImageIcon, Plus, Trash2, FileText, Paperclip, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import CodeBlock from './CodeBlock'

type Category = Database['public']['Tables']['categories']['Row']

interface CodeFile {
  id: string
  name: string
  language: string
  content: string
}

interface SharedFile {
  id: string
  name: string
  type: string
  size: number
  file: File
}

interface CreateSnippetModalProps {
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
}

const CreateSnippetModal: React.FC<CreateSnippetModalProps> = ({
  onClose,
  onSuccess,
  categories,
}) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    is_public: true,
    image_url: '',
    image_description: '',
  })
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'main.js',
      language: 'javascript',
      content: ''
    }
  ])
  const [activeFileId, setActiveFileId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [uploadType, setUploadType] = useState<'code' | 'files' | 'both'>('code')
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [uploading, setUploading] = useState(false)

  const languages = [
    'javascript',
    'typescript',
    'python',
    'css',
    'html',
    'sql',
    'bash',
    'json',
    'jsx',
    'tsx',
    'java',
    'php',
    'ruby',
    'go',
    'rust',
    'swift',
    'kotlin',
    'dart',
  ]

  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    const extensionMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'css': 'css',
      'html': 'html',
      'htm': 'html',
      'sql': 'sql',
      'sh': 'bash',
      'json': 'json',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'java': 'java',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    }
    return extensionMap[extension || ''] || 'javascript'
  }

  const getFileIcon = (fileType: string): string => {
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️'
    if (type.includes('word') || type.includes('doc')) return '📝'
    if (type.includes('excel') || type.includes('sheet')) return '📊'
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
    if (type.includes('text')) return '📄'
    if (type.includes('image')) return '🖼️'
    return '📁'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    const validFiles: SharedFile[] = []
    
    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`File type ${file.type} is not allowed`)
        return
      }
      
      if (file.size > maxSize) {
        setError(`File ${file.name} is too large. Maximum size is 10MB`)
        return
      }

      validFiles.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file
      })
    })

    setSharedFiles(prev => [...prev, ...validFiles])
    // Clear the input
    event.target.value = ''
  }

  const removeSharedFile = (fileId: string) => {
    setSharedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const uploadSharedFiles = async (postId: string): Promise<boolean> => {
    if (sharedFiles.length === 0) return true

    setUploading(true)
    try {
      for (const sharedFile of sharedFiles) {
        // Upload to Supabase Storage
        const fileName = `${user!.id}/${Date.now()}-${sharedFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shared-files')
          .upload(fileName, sharedFile.file)

        if (uploadError) {
          console.error('Error uploading file:', uploadError)
          setError(`Failed to upload ${sharedFile.name}`)
          return false
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('shared-files')
          .getPublicUrl(fileName)

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('user_shared_files')
          .insert([{
            user_id: user!.id,
            post_id: postId,
            file_name: sharedFile.name,
            file_url: publicUrl,
            file_type: sharedFile.type,
            file_size: sharedFile.size
          }])

        if (dbError) {
          console.error('Error saving file metadata:', dbError)
          setError(`Failed to save ${sharedFile.name} metadata`)
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Error uploading shared files:', error)
      setError('Failed to upload shared files')
      return false
    } finally {
      setUploading(false)
    }
  }

  const addFile = () => {
    const newId = Date.now().toString()
    const newFile: CodeFile = {
      id: newId,
      name: `file${files.length + 1}.js`,
      language: 'javascript',
      content: ''
    }
    setFiles(prev => [...prev, newFile])
    setActiveFileId(newId)
  }

  const removeFile = (fileId: string) => {
    if (files.length === 1) return // Don't allow removing the last file
    
    setFiles(prev => prev.filter(file => file.id !== fileId))
    if (activeFileId === fileId) {
      setActiveFileId(files[0].id === fileId ? files[1].id : files[0].id)
    }
  }

  const updateFile = (fileId: string, updates: Partial<CodeFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            ...updates,
            // Auto-detect language when filename changes
            ...(updates.name && { language: getLanguageFromFileName(updates.name) })
          }
        : file
    ))
  }

  const activeFile = files.find(file => file.id === activeFileId) || files[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a snippet')
      return
    }

    // Validate that there's either code content or shared files
    const hasCodeContent = files.some(file => file.content.trim())
    const hasSharedFiles = sharedFiles.length > 0
    
    if (!hasCodeContent && !hasSharedFiles) {
      setError('Please add either code content or shared files')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Combine all files into a single code string with file separators
      const combinedCode = hasCodeContent ? files.map(file => {
        if (!file.content.trim()) return ''
        return `// File: ${file.name}\n${file.content}`
      }).filter(Boolean).join('\n\n' + '='.repeat(50) + '\n\n') : ''

      // Use the primary language (first file with content)
      const primaryLanguage = hasCodeContent 
        ? files.find(file => file.content.trim())?.language || 'javascript'
        : 'text'

      const { data, error } = await supabase
        .from('code_snippets')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            code: combinedCode,
            language: primaryLanguage,
            category_id: formData.category_id || null,
            author_id: user.id,
            is_public: formData.is_public,
            image_url: formData.image_url,
            image_description: formData.image_description,
          },
        ])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }

      // Upload shared files if any
      if (sharedFiles.length > 0) {
        const uploadSuccess = await uploadSharedFiles(data[0].id)
        if (!uploadSuccess) {
          return
        } else {
          console.log('Snippet created successfully:', data)
          onSuccess()
        }
      } else {
        console.log('Snippet created successfully:', data)
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error creating snippet:', error)
      setError(error.message || 'An error occurred while creating the snippet')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Create New Code Snippet</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                {/* Upload Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Content Type *
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setUploadType('code')}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        uploadType === 'code'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className="h-4 w-4 mx-auto mb-1" />
                      Code Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('files')}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        uploadType === 'files'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Paperclip className="h-4 w-4 mx-auto mb-1" />
                      Files Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('media')}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        uploadType === 'media'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ImageIcon className="h-4 w-4 mx-auto mb-1" />
                      Media Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('both')}
                      className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                        uploadType === 'both'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Plus className="h-4 w-4 mx-auto mb-1" />
                      All Types
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter snippet title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your code snippet"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.category_id}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shared Files Section */}
                {(uploadType === 'files' || uploadType === 'both') && (
                  <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                      <Paperclip className="h-5 w-5 mr-2" />
                      Shared Files
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Files
                        </label>
                        <div className="flex items-center justify-center w-full">
                          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, ZIP, RAR, DOCX, XLSX, PPTX, TXT, Images (MAX 10MB each)
                              </p>
                            </div>
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileUpload}
                              accept=".pdf,.zip,.rar,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Uploaded Files List */}
                      {sharedFiles.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Uploaded Files ({sharedFiles.length})
                          </h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {sharedFiles.map(file => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{getFileIcon(file.type)}</span>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 truncate max-w-40">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeSharedFile(file.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Image Section */}
                <div className={`${(uploadType === 'files' || uploadType === 'both') ? '' : 'border-t'} pt-6`}>
                  <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Preview Image (Optional)
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.image_url}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add an image to showcase your code's output or provide visual context
                      </p>
                    </div>

                    {formData.image_url && (
                      <div>
                        <label htmlFor="image_description" className="block text-sm font-medium text-gray-700 mb-1">
                          Image Description
                        </label>
                        <input
                          type="text"
                          id="image_description"
                          name="image_description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.image_description}
                          onChange={handleChange}
                          placeholder="Describe what the image shows"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Help users understand what the image represents
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {formData.image_url && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 max-w-sm">
                          <img
                            src={formData.image_url}
                            alt={formData.image_description || 'Preview'}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="flex items-center justify-center h-32 bg-gray-200 text-gray-500">
                                    <div class="text-center">
                                      <svg class="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      <p class="mt-1 text-xs">Invalid image URL</p>
                                    </div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                    <span className="text-sm text-gray-700">Make this snippet public</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Public snippets can be viewed by all users. Private snippets are only visible to you.
                  </p>
                </div>
              </div>

              {/* Right Column - Code Files */}
              {(uploadType === 'code' || uploadType === 'both') && (
                <div className="space-y-4">
                {/* File Tabs */}
                <div className="border-b">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Code Files *
                    </label>
                    <button
                      type="button"
                      onClick={addFile}
                      className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add File
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`group flex items-center px-3 py-1 rounded-t-md text-sm cursor-pointer transition-colors ${
                          activeFileId === file.id
                            ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        onClick={() => setActiveFileId(file.id)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-20">{file.name}</span>
                        {files.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(file.id)
                            }}
                            className="ml-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active File Editor */}
                {activeFile && (
                  <div className="space-y-3">
                    {/* File Settings */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          File Name
                        </label>
                        <input
                          type="text"
                          value={activeFile.name}
                          onChange={(e) => updateFile(activeFile.id, { name: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="filename.ext"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select
                          value={activeFile.language}
                          onChange={(e) => updateFile(activeFile.id, { language: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>
                              {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Code Editor/Preview Toggle */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {activeFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {showPreview ? 'Edit' : 'Preview'}
                      </button>
                    </div>

                    {/* Code Content */}
                    {showPreview ? (
                      <div className="min-h-64">
                        <CodeBlock
                          code={activeFile.content || '// No content yet'}
                          language={activeFile.language}
                          showCopyButton={false}
                        />
                      </div>
                    ) : (
                      <textarea
                        value={activeFile.content}
                        onChange={(e) => updateFile(activeFile.id, { content: e.target.value })}
                        rows={18}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder={`Enter your ${activeFile.language} code here...`}
                      />
                    )}
                  </div>
                )}
                </div>
              )}
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
            disabled={loading || uploading || !formData.title.trim() || (!files.some(f => f.content.trim()) && sharedFiles.length === 0)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading || uploading ? 'Creating...' : 'Create Snippet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSnippetModal