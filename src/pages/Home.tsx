import React, { useState, useEffect } from 'react'
import { Search, ArrowUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import CodeCard from '../components/CodeCard'
import { Link } from 'react-router-dom'

type CodeSnippet = Database['public']['Tables']['code_snippets']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row']
  categories: Database['public']['Tables']['categories']['Row'] | null
  likes_count?: number
}

type Category = Database['public']['Tables']['categories']['Row']

const Home: React.FC = () => {
  const { user } = useAuth()
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showGoToTop, setShowGoToTop] = useState(false)

  useEffect(() => {
    fetchAllData()
    const handleScroll = () => setShowGoToTop(window.scrollY > 300)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [snipRes, catsRes, likesRes] = await Promise.all([
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
          .eq('is_public', true),
        supabase.from('categories').select('*').order('name'),
        supabase.from('likes').select('snippet_id')
      ])

      if (snipRes.error) throw snipRes.error
      if (catsRes.error) throw catsRes.error

      const likeCounts: Record<string, number> = {}
      if (likesRes.data) {
        likesRes.data.forEach((l: any) => {
          likeCounts[l.snippet_id] = (likeCounts[l.snippet_id] || 0) + 1
        })
      }

      const snippetsWithLikes = (snipRes.data || []).map((s: any) => ({
        ...s,
        likes_count: likeCounts[s.id] || 0,
      })) as CodeSnippet[]

      setSnippets(snippetsWithLikes)
      setCategories(catsRes.data || [])

      if (user) {
        const { data: userLikesData, error: userLikesError } = await supabase
          .from('likes')
          .select('snippet_id')
          .eq('user_id', user.id)
        if (!userLikesError && userLikesData) {
          setUserLikes(new Set(userLikesData.map((l: any) => l.snippet_id)))
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (snippetId: string) => {
    if (!user) return
    const prevUserLikes = new Set(userLikes)
    const prevSnippets = snippets.map(s => ({ ...s }))
    const isCurrentlyLiked = userLikes.has(snippetId)

    setUserLikes(prev => {
      const copy = new Set(prev)
      if (isCurrentlyLiked) copy.delete(snippetId)
      else copy.add(snippetId)
      return copy
    })

    setSnippets(prev =>
      prev.map(s => {
        if (s.id !== snippetId) return s
        const current = s.likes_count || 0
        return { ...s, likes_count: isCurrentlyLiked ? Math.max(0, current - 1) : current + 1 }
      })
    )

    try {
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippetId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ user_id: user.id, snippet_id: snippetId }])
        if (error) throw error
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      setUserLikes(prevUserLikes)
      setSnippets(prevSnippets)
    }
  }

  const handleViewIncrement = (snippetId: string) => {
    setSnippets(prev =>
      prev.map(snippet =>
        snippet.id === snippetId ? { ...snippet, views: (snippet.views || 0) + 1 } : snippet
      )
    )
  }

  const handleGoToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const filteredSnippets = snippets
    .filter(snippet => {
      const matchesSearch =
        snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.code.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = !selectedCategory || snippet.category_id === selectedCategory
      const matchesLanguage = !selectedLanguage || snippet.language === selectedLanguage
      return matchesSearch && matchesCategory && matchesLanguage
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'mostLiked':
          return (b.likes_count || 0) - (a.likes_count || 0)
        case 'mostViewed':
          return (b.views || 0) - (a.views || 0)
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  const languages = Array.from(new Set(snippets.map(snippet => snippet.language)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-400">
        Loading snippets...
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-br from-[#0a0f1c] via-[#050814] to-[#0b1122]">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-3">
          Welcome to <span className="text-blue-500">CodeShare ❤️</span>
        </h1>
        <p className="text-blue-300 text-lg mt-2">Share your code. Collaborate. Grow 🚀</p>
      </div>

      {/* Search & Filters */}
      <div className="max-w-4xl mx-auto bg-[#0a0f1c]/70 border border-blue-900/50 rounded-2xl shadow-lg p-6 backdrop-blur-md mb-10">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search code snippets..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-blue-900/50 bg-[#050814]/90 text-blue-100 placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <select
            className="flex-1 px-4 py-2 rounded-lg border border-blue-900/50 bg-[#050814]/90 text-blue-100 focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="flex-1 px-4 py-2 rounded-lg border border-blue-900/50 bg-[#050814]/90 text-blue-100 focus:ring-2 focus:ring-blue-500"
            value={selectedLanguage}
            onChange={e => setSelectedLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="flex-1 px-4 py-2 rounded-lg border border-blue-900/50 bg-[#050814]/90 text-blue-100 focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="mostLiked">Most Liked</option>
            <option value="mostViewed">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Snippets */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Explore Code Snippets</h2>
        <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 transition">
          View All →
        </Link>
      </div>

      {filteredSnippets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map(snippet => (
            <CodeCard
              key={snippet.id}
              snippet={snippet}
              onLike={user ? handleLike : undefined}
              isLiked={userLikes.has(snippet.id)}
              onViewIncrement={handleViewIncrement}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-blue-950/20 border border-blue-900/40 rounded-xl p-8 max-w-2xl mx-auto">
          <p className="text-xl font-semibold text-white mb-2">No code snippets found</p>
          <p className="text-sm text-blue-300 mb-4">
            {searchTerm || selectedCategory || selectedLanguage
              ? 'Try adjusting your search terms or filters.'
              : 'If you have deployed to Vercel, ensure you clicked "Redeploy" after adding environment variables.'}
          </p>
          <div className="text-xs bg-black/40 p-4 rounded-lg text-left text-blue-200 space-y-2 border border-blue-800/30">
            <p className="font-bold text-yellow-400">💡 Checklist for Vercel Data Loading:</p>
            <p>1. <strong>Redeploy on Vercel:</strong> In Vercel Dashboard → Deployments → Click <em>Redeploy</em> (Vite bakes env vars into JavaScript at build time).</p>
            <p>2. <strong>Supabase Seed Data:</strong> Run <code className="text-blue-300 font-mono">full_schema.sql</code> & seed scripts in your Supabase SQL Editor if your database is empty.</p>
          </div>
        </div>
      )}

      {showGoToTop && (
        <button
          onClick={handleGoToTop}
          className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all z-50"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}

export default Home  