import React, { useState } from 'react'
import { Eye, Heart, User, Calendar, Code2, FileText, Paperclip, Download, Bookmark } from 'lucide-react'
import { Database } from '../lib/database.types'
import { formatDistanceToNow } from '../utils/dateUtils'
import { supabase } from '../lib/supabase'
import CodeModal from './CodeModal'
import ReadMore from './ReadMore'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useSavedSnippets } from '../hooks/useSavedSnippets'

type CodeSnippet = Database['public']['Tables']['code_snippets']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row'] | null
}

type SharedFile = {
  id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

interface CodeCardProps {
  snippet: CodeSnippet
  onLike?: (snippetId: string) => void
  isLiked?: boolean
  showFullCode?: boolean
  onViewIncrement?: (snippetId: string) => void
  showSaveButton?: boolean
}

interface ParsedFile {
  name: string
  content: string
}

const CodeCard: React.FC<CodeCardProps> = ({
  snippet,
  onLike,
  isLiked = false,
  showFullCode = false,
  onViewIncrement,
  showSaveButton = true,
}) => {
  const [viewCount, setViewCount] = useState(snippet.views)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const hasImage = snippet.image_url && snippet.image_url.trim() !== ''
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { toggleSaveSnippet, isSnippetSaved } = useSavedSnippets()

  React.useEffect(() => {
    fetchSharedFiles()
  }, [snippet.id])

  const fetchSharedFiles = async () => {
    setLoadingFiles(true)
    try {
      const { data } = await supabase
        .from('user_shared_files')
        .select('*')
        .eq('post_id', snippet.id)
        .order('created_at', { ascending: true })

      setSharedFiles(data || [])
    } finally {
      setLoadingFiles(false)
    }
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

  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSaveSnippet = async () => {
    if (!user) return navigate('/login')
    try {
      const result = await toggleSaveSnippet(snippet.id)
      const message =
        result.action === 'saved' ? 'Snippet saved!' : 'Removed from saved'
      showToast(message, 'success')
    } catch {
      showToast('Failed to save snippet', 'error')
    }
  }

  const parseFiles = (code: string): ParsedFile[] => {
    const separator = '='.repeat(50)
    const parts = code.split(separator)
    return parts
      .map(part => {
        const lines = part.trim().split('\n')
        const firstLine = lines[0] || ''
        if (firstLine.startsWith('// File:')) {
          const fileName = firstLine.replace('// File:', '').trim()
          const content = lines.slice(1).join('\n').trim()
          return { name: fileName, content }
        }
        return { name: 'main.' + snippet.language, content: part.trim() }
      })
      .filter(file => file.content.length > 0)
  }

  const files = parseFiles(snippet.code)
  const isMultiFile = files.length > 1

  const handleViewCode = async () => {
    if (!user) {
      const today = new Date().toISOString().split('T')[0]
      const stored = JSON.parse(localStorage.getItem('guestViewData') || '{}')
      let count = stored?.count || 0
      let lastDate = stored?.date || today

      if (lastDate !== today) {
        count = 0
        lastDate = today
      }
      if (count >= 5) return navigate('/login')
      count++
      localStorage.setItem('guestViewData', JSON.stringify({ count, date: today }))
    }
    setShowCodeModal(true)
    await supabase.rpc('increment_snippet_views', { snippet_uuid: snippet.id })
    setViewCount(prev => prev + 1)
    onViewIncrement?.(snippet.id)
  }

  return (
    <>
      <div className="bg-transparent border border-gray-700/40 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-blue-900/30 transition-all duration-300 overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="p-5 flex-shrink-0">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-white line-clamp-2">
              {snippet.title}
            </h3>
            {snippet.categories && (
              <span
                className="text-xs px-2 py-1 rounded-full text-white bg-blue-600/40 border border-blue-500/30 backdrop-blur-sm"
              >
                {snippet.categories.name}
              </span>
            )}
          </div>

          {snippet.description && (
            <div className="mt-2">
              <ReadMore
                text={snippet.description}
                maxChars={150}
                className="text-sm text-gray-200"
              />
            </div>
          )}

          <div className="flex justify-between text-sm text-gray-300 mt-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-400" />
                {snippet.profiles.username}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-gray-400">
                <Eye className="h-4 w-4" /> {viewCount}
              </span>
              {showSaveButton && user && (
                <button
                  onClick={handleSaveSnippet}
                  className={`flex items-center gap-1 ${
                    isSnippetSaved(snippet.id)
                      ? 'text-blue-400'
                      : 'text-gray-400 hover:text-blue-300'
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${
                      isSnippetSaved(snippet.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>
              )}
              <button
                onClick={() => onLike?.(snippet.id)}
                className={`flex items-center gap-1 ${
                  isLiked
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-400 transition-colors'
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {snippet.likes}
              </button>
            </div>
          </div>
        </div>

        {/* Image / Content */}
        <div className="px-5 pb-5 flex-1 flex flex-col">
          {hasImage ? (
            <div className="relative rounded-lg overflow-hidden mb-4">
              <img
                src={snippet.image_url}
                alt={snippet.image_description || snippet.title}
                className="w-full h-48 object-cover opacity-90 hover:opacity-100 transition-all"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-gray-700/50 rounded-lg bg-white/5">
              <Code2 className="h-8 w-8 text-blue-400 mb-2" />
              <p className="text-sm text-gray-300">
                {isMultiFile ? `${files.length} Files` : snippet.language}
              </p>
            </div>
          )}

          {snippet.image_description && (
            <p className="text-sm text-gray-300 italic mb-4">{snippet.image_description}</p>
          )}

          {/* Shared Files */}
          {sharedFiles.length > 0 && (
            <div className="bg-white/5 border border-gray-700/40 rounded-lg p-3 mb-3 backdrop-blur-md">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                <Paperclip className="h-4 w-4 mr-2" /> Shared Files ({sharedFiles.length})
              </h4>
              <div className="space-y-2">
                {sharedFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 rounded bg-white/10 border border-gray-600/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getFileIcon(file.file_type)}</span>
                      <p className="text-sm text-white truncate">{file.file_name}</p>
                      <p className="text-xs text-gray-300">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFileDownload(file.file_url, file.file_name)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Code Button */}
          {files.length > 0 && (
            <div className="flex justify-center mt-auto">
              <button
                onClick={handleViewCode}
                className="px-5 py-2 border border-blue-500/40 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-600/20 hover:border-blue-400/60 transition-all"
              >
                <Code2 className="inline h-4 w-4 mr-1" /> View Code
              </button>
            </div>
          )}
        </div>
      </div>

      <CodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        title={snippet.title}
        code={snippet.code}
        language={snippet.language}
        files={files}
        isMultiFile={isMultiFile}
      />
    </>
  )
}

export default CodeCard
