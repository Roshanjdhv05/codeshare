import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { UserPlus, UserCheck, Folder, Calendar, Tag, Globe, FileText, Users, Code2, Eye, Heart, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Link } from 'react-router-dom'
import CodeModal from '../components/CodeModal'
import CodeCard from '../components/CodeCard'

type Profile = Database['public']['Tables']['profiles']['Row']
type UserFolder = Database['public']['Tables']['user_folders']['Row']
type UserFile = Database['public']['Tables']['user_files']['Row']
type CodeSnippet = Database['public']['Tables']['code_snippets']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row'] | null
}

interface ProfileWithStats extends Profile {
  followers_count: number
  following_count: number
  public_folders_count: number
}

const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileWithStats | null>(null)
  const [folders, setFolders] = useState<UserFolder[]>([])
  const [folderFiles, setFolderFiles] = useState<{ [key: string]: UserFile[] }>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null)
  const [selectedFile, setSelectedFile] = useState<UserFile | null>(null)
  const [showFileModal, setShowFileModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'folders'>('posts')

  useEffect(() => {
    if (username) {
      fetchProfileData()
    }
  }, [username, user])

  const fetchProfileData = async () => {
    if (!username) return

    try {
      // Fetch profile by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        setLoading(false)
        return
      }

      // Get profile stats
      const { data: stats } = await supabase
        .rpc('get_user_stats', { user_uuid: profileData.id })

      const statsData = stats && stats.length > 0 ? stats[0] : {
        followers_count: 0,
        following_count: 0,
        public_folders_count: 0
      }

      setProfile({
        ...profileData,
        ...statsData
      })

      // Check if current user is following this profile
      if (user && user.id !== profileData.id) {
        const { data: followData, error: followError } = await supabase
          .from('user_followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id)

        if (!followError) {
          setIsFollowing(followData && followData.length > 0)
        }
      }

      // Fetch public folders and snippets in parallel
      const [foldersResult, snippetsResult] = await Promise.all([
        supabase
          .from('user_folders')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_public', true)
          .order('updated_at', { ascending: false }),
        
        supabase
          .from('code_snippets')
          .select(`
            *,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            ),
            categories (
              id,
              name,
              color
            )
          `)
          .eq('author_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
      ])

      if (foldersResult.error) {
        console.error('Error fetching folders:', foldersResult.error)
      } else {
        setFolders(foldersResult.data)
      }

      if (snippetsResult.error) {
        console.error('Error fetching snippets:', snippetsResult.error)
      } else {
        setSnippets(snippetsResult.data as CodeSnippet[])
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolderFiles = async (folderId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('folder_id', folderId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching folder files:', error)
      } else {
        setFolderFiles(prev => ({
          ...prev,
          [folderId]: data
        }))
      }
    } catch (error) {
      console.error('Error fetching folder files:', error)
    }
  }

  const toggleFolder = async (folderId: string) => {
    const isExpanded = expandedFolders.has(folderId)
    
    if (isExpanded) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev)
        newSet.delete(folderId)
        return newSet
      })
    } else {
      setExpandedFolders(prev => new Set(prev).add(folderId))
      
      // Fetch files if not already loaded
      if (!folderFiles[folderId]) {
        await fetchFolderFiles(folderId)
      }
    }
  }

  const handleFileClick = (file: UserFile) => {
    setSelectedFile(file)
    setShowFileModal(true)
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

  const handleFollow = async () => {
    if (!user || !profile) return

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)

        if (error) {
          console.error('Error unfollowing user:', error)
          return
        }

        setIsFollowing(false)
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count - 1 } : null)
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert([{ follower_id: user.id, following_id: profile.id }])

        if (error) {
          console.error('Error following user:', error)
          return
        }

        setIsFollowing(true)
        setProfile(prev => prev ? { ...prev, followers_count: prev.followers_count + 1 } : null)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleViewCode = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet)
    setShowCodeModal(true)
  }

  const parseFiles = (code: string) => {
    const separator = '='.repeat(50)
    const parts = code.split(separator)
    
    return parts.map(part => {
      const lines = part.trim().split('\n')
      const firstLine = lines[0] || ''
      
      if (firstLine.startsWith('// File:')) {
        const fileName = firstLine.replace('// File:', '').trim()
        const content = lines.slice(1).join('\n').trim()
        return { name: fileName, content }
      }
      
      return { name: 'main.' + (snippet.language === 'javascript' ? 'js' : snippet.language), content: part.trim() }
    }).filter(file => file.content.length > 0)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The user you're looking for doesn't exist.</p>
          <Link
            to="/explore"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Explore Users
          </Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.full_name || profile.username}</h1>
              <p className="text-blue-200">@{profile.username}</p>
              {profile.bio && (
                <p className="text-blue-100 mt-2">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-3 text-sm text-blue-200">
                <span><strong>{profile.followers_count}</strong> followers</span>
                <span><strong>{profile.following_count}</strong> following</span>
                <span><strong>{profile.public_folders_count}</strong> public folders</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isOwnProfile && user && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleFollow}
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  isFollowing
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </button>
            </div>
          )}

          {isOwnProfile && (
            <Link
              to="/my-profile"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-blue-800">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Code Snippets ({snippets.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'folders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Public Folders ({folders.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        /* Posts Tab */
        <div>
          {snippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map(snippet => (
                <CodeCard
                  key={snippet.id}
                  snippet={snippet}
                  showSaveButton={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No public code snippets</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isOwnProfile 
                  ? 'Create your first public snippet to share with the community.'
                  : `${profile.username} hasn't shared any public code snippets yet.`}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Folders Tab */
        <div>
          {folders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map(folder => (
                <div
                  key={folder.id}
                  className="bg-white/5 border border-blue-900/40 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-900/50 rounded-lg flex items-center justify-center">
                          <Folder className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {folder.folder_name}
                          </h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/40 border border-green-700/40 text-green-300 mt-1">
                            <Globe className="h-3 w-3 mr-1" />
                            Public
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {folder.description && (
                      <p className="text-blue-200 text-sm mb-4 line-clamp-2">
                        {folder.description}
                      </p>
                    )}

                    {/* Tags */}
                    {folder.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {folder.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/40 border border-blue-700/30 text-blue-200"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {folder.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/40 border border-blue-700/30 text-blue-200">
                            +{folder.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-blue-300">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}</span>
                      </div>
                      <Link
                        to={`/profile/${profile?.username}/folder/${folder.id}`}
                        className="text-blue-400 hover:text-blue-300 font-medium"
                      >
                        View Folder →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No public folders</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isOwnProfile 
                  ? 'Create your first public folder to share your projects.'
                  : `${profile.username} hasn't shared any public folders yet.`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* File Modal */}
      {showFileModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(selectedFile.extension)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedFile.filename}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="uppercase font-medium">{selectedFile.extension}</span>
                    <span>{selectedFile.code_content?.split('\n').length || 0} lines</span>
                    <span>{selectedFile.code_content?.length || 0} characters</span>
                    <span>Modified {formatDistanceToNow(new Date(selectedFile.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedFile.code_content || '')
                      // Could add a toast notification here
                    } catch (error) {
                      console.error('Failed to copy code:', error)
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  title="Copy code"
                >
                  📋 Copy Code
                </button>
                <button
                  onClick={() => {
                    setShowFileModal(false)
                    setSelectedFile(null)
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] p-6">
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <pre className="p-4 overflow-x-auto text-sm text-gray-100">
                  <code className={`language-${getLanguageFromExtension(selectedFile.extension)}`}>
                    {selectedFile.code_content || '// Empty file'}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Code Modal */}
      {showCodeModal && selectedSnippet && (
        <CodeModal
          isOpen={showCodeModal}
          onClose={() => {
            setShowCodeModal(false)
            setSelectedSnippet(null)
          }}
          title={selectedSnippet.title}
          code={selectedSnippet.code}
          language={selectedSnippet.language}
          files={parseFiles(selectedSnippet.code)}
          isMultiFile={parseFiles(selectedSnippet.code).length > 1}
        />
      )}
    </div>
  )
}

export default PublicProfile