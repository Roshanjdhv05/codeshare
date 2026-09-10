import React, { useState, useEffect } from 'react'
import { Plus, Search, Folder, Calendar, Tag, Trash2, FileText, Download, Lock, Globe, Code2, Eye, Heart, Edit, Bookmark } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { Link } from 'react-router-dom'
import CreateFolderModal from '../components/CreateFolderModal'
import EditFolderModal from '../components/EditFolderModal'
import EditSnippetModal from '../components/EditSnippetModal'
import FollowersModal from '../components/FollowersModal'
import CodeCard from '../components/CodeCard'
import { useSavedSnippets } from '../hooks/useSavedSnippets'

type UserFollower = Database['public']['Tables']['user_followers']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
}

type UserFolder = Database['public']['Tables']['user_folders']['Row']
type CodeSnippet = Database['public']['Tables']['code_snippets']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row'] | null
}

const MyProfile: React.FC = () => {
  const { user, profile } = useAuth()
  const { savedSnippets } = useSavedSnippets()
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'folders'>('posts')
  const [folders, setFolders] = useState<UserFolder[]>([])
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [followers, setFollowers] = useState<UserFollower[]>([])
  const [following, setFollowing] = useState<UserFollower[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFolder, setEditingFolder] = useState<UserFolder | null>(null)
  const [editingSnippet, setEditingSnippet] = useState<CodeSnippet | null>(null)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [followersType, setFollowersType] = useState<'followers' | 'following'>('followers')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [stats, setStats] = useState({
    followers_count: 0,
    following_count: 0,
    public_folders_count: 0
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchUserStats()
      fetchFollowers()
      fetchFollowing()
    }
  }, [user])

  useEffect(() => {
    if (searchTerm.trim() && activeTab === 'folders') {
      performSearch()
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchTerm, activeTab])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch folders and snippets in parallel
      const [foldersResult, snippetsResult] = await Promise.all([
        supabase
          .from('user_folders')
          .select('*')
          .eq('user_id', user.id)
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
          .eq('author_id', user.id)
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
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    if (!user) return

    try {
      const { data, error } = await (supabase as any)
        .rpc('get_user_stats', { user_uuid: user.id })

      if (error) {
        console.error('Error fetching user stats:', error)
      } else if (Array.isArray(data) && data.length > 0) {
        setStats(data[0])
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchFollowers = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select(`
          *,
          profiles!user_followers_follower_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('following_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching followers:', error)
      } else {
        setFollowers(data as UserFollower[])
      }
    } catch (error) {
      console.error('Error fetching followers:', error)
    }
  }

  const fetchFollowing = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select(`
          *,
          profiles!user_followers_following_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching following:', error)
      } else {
        setFollowing(data as UserFollower[])
      }
    } catch (error) {
      console.error('Error fetching following:', error)
    }
  }

  const performSearch = async () => {
    if (!user || !searchTerm.trim()) return

    setIsSearching(true)
    try {
      const { data, error } = await (supabase as any)
        .rpc('search_user_files', {
          search_user_id: user.id,
          search_term: searchTerm.trim()
        })

      if (error) {
        console.error('Error searching files:', error)
      } else {
        setSearchResults(data || [])
      }
    } catch (error) {
      console.error('Error searching files:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm('Are you sure you want to delete this folder? All files inside will be deleted.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_folders')
        .delete()
        .eq('id', folderId)

      if (error) {
        console.error('Error deleting folder:', error)
      } else {
        setFolders(prev => prev.filter(folder => folder.id !== folderId))
        fetchUserStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  const handleFolderCreated = () => {
    setShowCreateModal(false)
    fetchUserData()
    fetchUserStats()
  }

  const handleFolderUpdated = () => {
    setEditingFolder(null)
    fetchUserData()
    fetchUserStats()
  }

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('code_snippets')
        .delete()
        .eq('id', snippetId)

      if (error) {
        console.error('Error deleting snippet:', error)
      } else {
        setSnippets(prev => prev.filter(snippet => snippet.id !== snippetId))
        fetchUserStats() // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting snippet:', error)
    }
  }

  const handleSnippetUpdated = () => {
    setEditingSnippet(null)
    fetchUserData()
  }

  const handleUnfollow = async (followingId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', followingId)

      if (error) {
        console.error('Error unfollowing user:', error)
      } else {
        fetchFollowing()
        fetchUserStats()
      }
    } catch (error) {
      console.error('Error unfollowing user:', error)
    }
  }

  const handleRemoveFollower = async (followerId: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', user.id)

      if (error) {
        console.error('Error removing follower:', error)
      } else {
        fetchFollowers()
        fetchUserStats()
      }
    } catch (error) {
      console.error('Error removing follower:', error)
    }
  }

  const openFollowersModal = (type: 'followers' | 'following') => {
    setFollowersType(type)
    setShowFollowersModal(true)
  }

  const downloadFolder = async (folderId: string, folderName: string) => {
    try {
      const { data: files, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('folder_id', folderId) as { data: { filename: string; extension: string; code_content: string }[] | null; error: any }

      if (error) {
        console.error('Error fetching files for download:', error)
        return
      }

      // Create a simple text-based "ZIP" content
      let zipContent = `# ${folderName} - Exported Files\n\n`
      
      if (!files) return

      files.forEach(file => {
        zipContent += `## ${file.filename}\n`
        zipContent += `\`\`\`${file.extension}\n`
        zipContent += file.code_content
        zipContent += `\n\`\`\`\n\n`
      })

      // Create and download the file
      const blob = new Blob([zipContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${folderName.replace(/[^a-zA-Z0-9]/g, '_')}_export.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading folder:', error)
    }
  }

  const filteredFolders = folders.filter(folder =>
    folder.folder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile?.full_name || profile?.username}</h1>
              <p className="text-blue-200">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-blue-100 mt-2">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-3 text-sm text-blue-200">
                <button
                  onClick={() => openFollowersModal('followers')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <strong>{stats.followers_count}</strong> followers
                </button>
                <button
                  onClick={() => openFollowersModal('following')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <strong>{stats.following_count}</strong> following
                </button>
                <span><strong>{stats.public_folders_count}</strong> public folders</span>
              </div>
            </div>
          </div>
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
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Dashboard Posts ({snippets.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'saved'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Snippets ({savedSnippets.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'folders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                My Folders ({folders.length})
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' ? (
        /* Posts Tab */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">My Code Snippets</h2>
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Snippet
            </Link>
          </div>

          {snippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {snippets.map(snippet => (
                <div key={snippet.id} className="bg-white/5 border border-blue-900/40 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white line-clamp-2">
                      {snippet.title}
                    </h3>
                    {snippet.categories && (
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white flex-shrink-0 ml-2 bg-blue-600/40 border border-blue-500/30"
                      >
                        {snippet.categories.name}
                      </span>
                    )}
                  </div>
                  
                  {snippet.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {snippet.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/40 border border-blue-700/40 text-blue-200">
                      {snippet.language}
                    </span>
                    <span>{formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{snippet.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{snippet.likes}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      snippet.is_public 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                    }`}>
                      {snippet.is_public ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      )}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => setEditingSnippet(snippet)}
                      className="inline-flex items-center px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSnippet(snippet.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm rounded hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Code2 className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No code snippets yet</h3>
              <p className="text-blue-200 mb-6">Create your first snippet to get started</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Snippet
              </Link>
            </div>
          )}
        </div>
      ) : activeTab === 'saved' ? (
        /* Saved Snippets Tab */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Saved Code Snippets</h2>
          </div>

          {savedSnippets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSnippets.map((save) => {
                const snippet = save.code_snippets as CodeSnippet
                return (
                  <CodeCard
                    key={save.id}
                    snippet={snippet}
                    showSaveButton={true}
                    onLike={user ? async (_snippetId: string) => {
                      // Like functionality handled in CodeCard
                    } : undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No saved snippets yet</h3>
              <p className="text-blue-200 mb-6">
                Save interesting code snippets from the community to view them later
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Search className="h-4 w-4 mr-2" />
                Explore Snippets
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Folders Tab */
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">My Folders</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search folders and files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Search Results */}
          {searchTerm.trim() && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Search Results {isSearching && <span className="text-sm text-gray-500 dark:text-gray-400">(searching...)</span>}
              </h3>
              {searchResults.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                  {searchResults.map((result, index) => (
                    <Link
                      key={result.file_id}
                      to={`/my-profile/folder/${result.folder_id}`}
                      className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index !== searchResults.length - 1 ? 'border-b border-gray-200 dark:border-gray-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{result.filename}</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-100 px-2 py-1 rounded flex-shrink-0">
                              {result.extension}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            in <span className="font-medium text-gray-600 dark:text-gray-300">{result.folder_name}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-300 flex-shrink-0">
                          {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !isSearching && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-300" />
                  <p>No files found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          )}

          {/* Folders Grid */}
          {filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  className="bg-white/5 border border-blue-900/40 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {folder.folder_name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              folder.is_public 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                            }`}>
                              {folder.is_public ? (
                                <>
                                  <Globe className="h-3 w-3 mr-1" />
                                  Public
                                </>
                              ) : (
                                <>
                                  <Lock className="h-3 w-3 mr-1" />
                                  Private
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingFolder(folder)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Edit folder"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadFolder(folder.id, folder.folder_name)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          title="Download folder"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-1 text-gray-400 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {folder.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {folder.description}
                      </p>
                    )}

                    {/* Tags */}
                    {folder.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {folder.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {folder.tags.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
                            +{folder.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(folder.created_at), { addSuffix: true })}</span>
                      </div>
                      <Link
                        to={`/my-profile/folder/${folder.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                      >
                        Open →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto text-blue-300 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No folders yet</h3>
              <p className="text-blue-200 mb-6">
                {searchTerm ? 'No folders match your search.' : 'Create your first folder to organize your code files.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Folder
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateModal && (
        <CreateFolderModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFolderCreated}
        />
      )}

      {/* Edit Folder Modal */}
      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onSuccess={handleFolderUpdated}
        />
      )}

      {/* Edit Snippet Modal */}
      {editingSnippet && (
        <EditSnippetModal
          snippet={editingSnippet}
          onClose={() => setEditingSnippet(null)}
          onSuccess={handleSnippetUpdated}
        />
      )}

      {/* Followers Modal */}
      {showFollowersModal && (
        <FollowersModal
          type={followersType}
          followers={followersType === 'followers' ? followers : following}
          onClose={() => setShowFollowersModal(false)}
          onUnfollow={handleUnfollow}
          onRemoveFollower={handleRemoveFollower}
          currentUserId={user?.id || ''}
        />
      )}
    </div>
  )
}

export default MyProfile  