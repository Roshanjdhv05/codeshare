import React, { useState, useEffect } from 'react'
import { Plus, Eye, Heart, Search, Filter, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import CodeCard from '../components/CodeCard'
import CreateSnippetModal from '../components/CreateSnippetModal'

type CodeSnippet = Database['public']['Tables']['code_snippets']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row'] | null
}

type Category = Database['public']['Tables']['categories']['Row']

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [sortOption, setSortOption] = useState<string>('newest')

  useEffect(() => {
    if (user) {
      fetchUserSnippets()
      fetchCategories()
    }
  }, [user])

  const fetchUserSnippets = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
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

      if (!error && data) setSnippets(data as CodeSnippet[])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!window.confirm('Delete this snippet?')) return
    await supabase.from('code_snippets').delete().eq('id', snippetId)
    setSnippets(prev => prev.filter(snippet => snippet.id !== snippetId))
  }

  const handleSnippetCreated = () => {
    setShowCreateModal(false)
    fetchUserSnippets()
  }

  const handleViewIncrement = (snippetId: string) => {
    setSnippets(prev =>
      prev.map(snippet =>
        snippet.id === snippetId
          ? { ...snippet, views: snippet.views + 1 }
          : snippet
      )
    )
  }

  const filteredSnippets = snippets
    .filter(snippet => {
      const matchesSearch =
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        !selectedCategory || snippet.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'most-viewed':
          return (b.views || 0) - (a.views || 0)
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0)
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
      }
    })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-blue-200">Loading...</div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Code Snippets</h1>
          <p className="mt-2 text-blue-300/80 text-sm sm:text-base">
            Manage and showcase your code creations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </button>
      </div>

      {/* Stats Section - Transparent Dark */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Total Snippets */}
        <div className="backdrop-blur-md bg-blue-950/30 border border-blue-900/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-800/40 rounded-md flex items-center justify-center">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-300/70">Total Snippets</p>
              <p className="text-2xl font-semibold text-blue-100">
                {snippets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="backdrop-blur-md bg-blue-950/30 border border-green-900/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(34,197,94,0.15)] hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-800/40 rounded-md flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-300/70">Total Views</p>
              <p className="text-2xl font-semibold text-green-100">
                {snippets.reduce((sum, s) => sum + (s.views || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Total Likes */}
        <div className="backdrop-blur-md bg-blue-950/30 border border-pink-900/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(236,72,153,0.15)] hover:shadow-[0_0_25px_rgba(236,72,153,0.25)] transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-pink-800/40 rounded-md flex items-center justify-center">
              <Heart className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-pink-300/70">Total Likes</p>
              <p className="text-2xl font-semibold text-pink-100">
                {snippets.reduce((sum, s) => sum + (s.likes || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8 backdrop-blur-md bg-blue-950/30 border border-blue-900/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400/70" />
            <input
              type="text"
              placeholder="Search snippets..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-blue-900/40 
                         bg-transparent text-blue-100 placeholder-blue-400/60 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-blue-400/70" />
            <select
              className="w-full pl-10 pr-4 py-2 rounded-md border border-blue-900/40 
                         bg-transparent text-blue-100 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500/60"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-blue-950">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <select
            className="w-full px-4 py-2 rounded-md border border-blue-900/40 
                       bg-transparent text-blue-100 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500/60"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="most-viewed">Most Viewed</option>
            <option value="most-liked">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Snippets Grid */}
      {filteredSnippets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map(snippet => (
            <div key={snippet.id} className="relative group">
              <CodeCard snippet={snippet} onViewIncrement={handleViewIncrement} showSaveButton={false} />
              <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteSnippet(snippet.id)}
                  className="p-2 bg-red-600/80 text-white rounded-md hover:bg-red-700 transition-colors shadow-lg"
                  title="Delete snippet"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-blue-300/80">
          <Plus className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg">No snippets yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600/80 text-white rounded-md hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Snippet
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateSnippetModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSnippetCreated}
          categories={categories}
        />
      )}
    </div>
  )
}

export default Dashboard
