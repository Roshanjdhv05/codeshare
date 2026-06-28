import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar, Eye, Download, Copy, Check, Globe, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { formatDistanceToNow } from '../utils/dateUtils'
import CodeBlock from '../components/CodeBlock'

type UserFolder = Database['public']['Tables']['user_folders']['Row']
type UserFile = Database['public']['Tables']['user_files']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

const PublicFolderDetail: React.FC = () => {
  const { username, folderId } = useParams<{ username: string; folderId: string }>()
  const navigate = useNavigate()
  const [folder, setFolder] = useState<UserFolder | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (username && folderId) {
      fetchFolderData()
    }
  }, [username, folderId])

  const fetchFolderData = async () => {
    if (!username || !folderId) return

    try {
      // First, get the profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        navigate('/explore')
        return
      }

      setProfile(profileData)

      // Then get the folder data
      const { data: folderData, error: folderError } = await supabase
        .from('user_folders')
        .select('*')
        .eq('id', folderId)
        .eq('user_id', profileData.id)
        .eq('is_public', true)
        .single()

      if (folderError) {
        console.error('Error fetching folder:', folderError)
        navigate(`/profile/${username}`)
        return
      }

      setFolder(folderData)

      // Finally, get the files in the folder
      const { data: filesData, error: filesError } = await supabase
        .from('user_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })

      if (filesError) {
        console.error('Error fetching files:', filesError)
      } else {
        setFiles(filesData)
      }
    } catch (error) {
      console.error('Error fetching folder data:', error)
      navigate('/explore')
    } finally {
      setLoading(false)
    }
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

  const getFileIcon = (extension: string) => {
    const iconMap: { [key: string]: string } = {
      'js': '🟨',
      'ts': '🔷',
      'py': '🐍',
      'html': '🌐',
      'css': '🎨',
      'json': '📋',
      'java': '☕',
      'php': '🐘',
      'rb': '💎',
      'go': '🐹',
      'rs': '🦀',
      'swift': '🍎',
      'kt': '🟣',
      'dart': '🎯',
    }
    return iconMap[extension] || '📄'
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
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

  if (!folder || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Folder not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The folder you're looking for doesn't exist or is not public.</p>
          <Link
            to={`/profile/${username}`}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={`/profile/${username}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{folder.folder_name}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <Globe className="h-4 w-4 mr-1" />
                Public
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <Eye className="h-4 w-4 mr-1" />
                View Only
              </span>
            </div>
            {folder.description && (
              <p className="text-gray-600 dark:text-gray-400">{folder.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>by {profile.full_name || profile.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}</span>
              </div>
              <span>{files.length} files</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {folder.tags && folder.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Files Grid */}
      <div>
        {files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {files.map(file => (
              <div key={file.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group flex flex-col">
                <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl">{getFileIcon(file.extension)}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {file.filename}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
                      {file.extension.toUpperCase()}
                    </span>
                  </div>

                  {/* File Stats */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-3 sm:p-4 text-center mb-3 sm:mb-4 flex-1">
                    <div className="flex justify-center mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-2">
                      {file.extension.toUpperCase()} File
                    </h4>
                    <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                      <span>{file.code_content?.split('\n').length || 0} lines</span>
                      <span>{file.code_content?.length || 0} chars</span>
                      <span className="capitalize">{getLanguageFromExtension(file.extension)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      View Code
                    </button>
                    <button
                      onClick={() => downloadFile(file)}
                      className="inline-flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      title="Download file"
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files in this folder</h3>
            <p className="text-gray-500 dark:text-gray-400">This folder doesn't contain any files yet.</p>
          </div>
        )}
      </div>

      {/* Code Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-gray-50 dark:bg-gray-700 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(previewFile.extension)}</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{previewFile.filename}</h2>
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 flex-wrap">
                    <span className="uppercase font-medium">{previewFile.extension}</span>
                    <span>{previewFile.code_content?.split('\n').length || 0} lines</span>
                    <span>{previewFile.code_content?.length || 0} characters</span>
                    <span>Modified {formatDistanceToNow(new Date(previewFile.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Read Only
                </span>
                <button
                  onClick={() => handleCopyCode(previewFile.code_content || '')}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
                <button
                  onClick={() => downloadFile(previewFile)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-600 text-white text-xs sm:text-sm rounded-md hover:bg-gray-700 transition-colors"
                  title="Download file"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-md hover:bg-red-700 transition-colors min-w-[80px]"
                  title="Close"
                >
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-4 sm:p-6">
              <CodeBlock
                code={previewFile.code_content || '// Empty file'}
                language={getLanguageFromExtension(previewFile.extension)}
                title={previewFile.filename}
                showCopyButton={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublicFolderDetail