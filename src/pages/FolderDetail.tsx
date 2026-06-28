import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, FileText, Edit, Trash2, Save, X, Play, Download, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import CodeBlock from '../components/CodeBlock'
import CreateFileModal from '../components/CreateFileModal'

type UserFolder = Database['public']['Tables']['user_folders']['Row']
type UserFile = Database['public']['Tables']['user_files']['Row']

const FolderDetail: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [folder, setFolder] = useState<UserFolder | null>(null)
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null)

  useEffect(() => {
    if (folderId && user) {
      fetchFolderData()
      fetchFiles()
    }
  }, [folderId, user])

  const fetchFolderData = async () => {
    if (!folderId || !user) return

    try {
      const { data, error } = await supabase
        .from('user_folders')
        .select('*')
        .eq('id', folderId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching folder:', error)
        navigate('/my-account')
        return
      }

      setFolder(data)
    } catch (error) {
      console.error('Error fetching folder:', error)
      navigate('/my-account')
    }
  }

  const fetchFiles = async () => {
    if (!folderId) return

    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
      } else {
        setFiles(data)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId)

      if (error) {
        console.error('Error deleting file:', error)
      } else {
        setFiles(prev => prev.filter(file => file.id !== fileId))
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  const handleEditFile = (file: UserFile) => {
    setEditingFile(file.id)
    setEditContent(file.code_content)
  }

  const handleSaveFile = async () => {
    if (!editingFile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_files')
        .update({ code_content: editContent })
        .eq('id', editingFile)

      if (error) {
        console.error('Error saving file:', error)
      } else {
        setFiles(prev => prev.map(file => 
          file.id === editingFile 
            ? { ...file, code_content: editContent }
            : file
        ))
        setEditingFile(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('Error saving file:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingFile(null)
    setEditContent('')
  }

  const handleFileCreated = () => {
    setShowCreateModal(false)
    fetchFiles()
  }

  const downloadFile = (file: UserFile) => {
    const blob = new Blob([file.code_content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const previewHtmlFile = (file: UserFile) => {
    if (file.extension !== 'html') return

    const htmlContent = file.code_content
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const getLanguageFromExtension = (extension: string): string => {
    const langMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'java': 'java',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'dart': 'dart',
    }
    return langMap[extension] || 'text'
  }

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.code_content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Folder not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The folder you're looking for doesn't exist or you don't have access.</p>
          <Link
            to="/my-profile"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 text-white dark:text-gray-100" />
            Back to My Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/my-profile"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-gray-900 dark:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{folder.folder_name}</h1>
            {folder.description && (
              <p className="mt-1 text-gray-600 dark:text-gray-400">{folder.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2 text-white dark:text-gray-100" />
            New File
          </button>
        </div>

        {/* Tags */}
        {folder.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {folder.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div>
        {filteredFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredFiles.map(file => (
              <div key={file.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group flex flex-col">
                {/* File Header */}
                <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {file.filename}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {file.extension}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                    {file.extension === 'html' && (
                      <button
                        onClick={() => previewHtmlFile(file)}
                        className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors rounded-md hover:bg-green-50 dark:hover:bg-green-900"
                        title="Preview HTML"
                      >
                        <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
                      title="Download file"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleEditFile(file)}
                      className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-md hover:bg-blue-50 dark:hover:bg-blue-900"
                      title="Edit file"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900"
                      title="Delete file"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                {/* File Content Preview */}
                <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 flex-1 flex flex-col">
                  {editingFile === file.id ? (
                    /* Edit Mode */
                    <div className="space-y-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Editing {file.filename}</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={handleSaveFile}
                            disabled={saving}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 text-xs sm:text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                          >
                            <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={12}
                        className="flex-1 w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-xs sm:text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Enter your code here..."
                      />
                    </div>
                  ) : (
                    /* View Mode - Code Preview */
                    <div className="flex-1 flex flex-col">
                      <div className="bg-gradient-to-br from-gray-50 dark:from-gray-800 to-gray-100 dark:to-gray-900 rounded-lg p-3 sm:p-4 md:p-6 text-center flex-1 flex flex-col justify-center min-h-32 sm:min-h-48">
                        <div className="flex justify-center mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {file.extension.toUpperCase()} File
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
                          {file.code_content 
                            ? `${file.code_content.split('\n').length} lines of code`
                            : 'Empty file'
                          }
                        </p>
                        <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                            {file.extension}
                          </span>
                          <span>{file.code_content?.length || 0} characters</span>
                        </div>
                      </div>

                      {/* View Full Code Button */}
                      <div className="flex justify-center pt-3 sm:pt-4">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm text-xs sm:text-sm"
                        >
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          View Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No files yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm ? 'No files match your search.' : 'Create your first file to start coding.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2 text-white dark:text-gray-100" />
                Create File
              </button>
            )}
          </div>
        )}
      </div>

      {/* Code Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 dark:bg-gray-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{previewFile.filename}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {previewFile.code_content?.split('\n').length || 0} lines • {previewFile.code_content?.length || 0} characters
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadFile(previewFile)}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  title="Download file"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  title="Close"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
              <CodeBlock
                code={previewFile.code_content || '// Empty file'}
                language={getLanguageFromExtension(previewFile.extension)}
                title={previewFile.filename}
                showCopyButton={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Create File Modal */}
      {showCreateModal && folder && (
        <CreateFileModal
          folder={folder}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFileCreated}
        />
      )}
    </div>
  )
}

export default FolderDetail