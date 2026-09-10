import React, { useState, useEffect } from 'react'
import { Users, UserPlus, UserCheck, User, ChevronDown, Code2, FolderOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Database } from '../lib/database.types'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { SearchBar } from '../components/SearchBar'
import { useDebounce } from '../hooks/useDebounce'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileWithStats = Profile & {
  followers_count: number
  following_count: number
  public_folders_count: number
  snippet_count?: number
  is_following: boolean
}

const PAGE_SIZE = 15

const Explore: React.FC = () => {
  const { user } = useAuth()
  const [allProfiles, setAllProfiles] = useState<ProfileWithStats[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'newest' | 'followers' | 'projects'>('newest')

  const debouncedSearchTerm = useDebounce(searchTerm, 400)

  useEffect(() => {
    fetchProfiles()
    if (user) fetchFollowingUsers()
  }, [user])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    if (debouncedSearchTerm.trim()) searchProfiles(debouncedSearchTerm)
    else fetchProfiles()
  }, [debouncedSearchTerm, filter])

  const fetchProfiles = async () => {
    setLoading(true)
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) { console.error('Error fetching profiles:', error); return }

      const profilesWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: stats } = await supabase.rpc('get_user_stats', { user_uuid: profile.id })
          const statsData = stats?.[0] ?? { followers_count: 0, following_count: 0, public_folders_count: 0 }
          const { count: snippetCount } = await supabase
            .from('code_snippets')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', profile.id)
            .eq('is_public', true)
          return { ...profile, ...statsData, snippet_count: snippetCount || 0, is_following: followingUsers.has(profile.id) }
        })
      )

      setAllProfiles(sortProfiles(profilesWithStats, filter))
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchProfiles = async (term: string) => {
    setLoading(true)
    try {
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${term}%,full_name.ilike.%${term}%`)
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) { console.error('Error searching profiles:', error); return }

      const profilesWithStats = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: stats } = await supabase.rpc('get_user_stats', { user_uuid: profile.id })
          const statsData = stats?.[0] ?? { followers_count: 0, following_count: 0, public_folders_count: 0 }
          const { count: snippetCount } = await supabase
            .from('code_snippets')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', profile.id)
            .eq('is_public', true)
          return { ...profile, ...statsData, snippet_count: snippetCount || 0, is_following: followingUsers.has(profile.id) }
        })
      )

      setAllProfiles(sortProfiles(profilesWithStats, filter))
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const sortProfiles = (profiles: ProfileWithStats[], filterType: typeof filter) => {
    if (filterType === 'followers') return [...profiles].sort((a, b) => b.followers_count - a.followers_count)
    if (filterType === 'projects') return [...profiles].sort((a, b) => b.public_folders_count - a.public_folders_count)
    return [...profiles].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  const fetchFollowingUsers = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.from('user_followers').select('following_id').eq('follower_id', user.id)
      if (!error) setFollowingUsers(new Set(data.map((d) => d.following_id)))
    } catch (error) {
      console.error('Error fetching following users:', error)
    }
  }

  const handleFollow = async (profileId: string) => {
    if (!user) return
    try {
      const isFollowing = followingUsers.has(profileId)
      if (isFollowing) {
        await supabase.from('user_followers').delete().eq('follower_id', user.id).eq('following_id', profileId)
        setFollowingUsers(prev => { const s = new Set(prev); s.delete(profileId); return s })
      } else {
        await supabase.from('user_followers').insert([{ follower_id: user.id, following_id: profileId }])
        setFollowingUsers(prev => new Set(prev).add(profileId))
      }
      setAllProfiles(prev =>
        prev.map(p => p.id === profileId
          ? { ...p, is_following: !isFollowing, followers_count: isFollowing ? p.followers_count - 1 : p.followers_count + 1 }
          : p
        )
      )
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    await new Promise(r => setTimeout(r, 300))
    setVisibleCount(prev => prev + PAGE_SIZE)
    setLoadingMore(false)
  }

  const visibleProfiles = allProfiles.slice(0, visibleCount)
  const hasMore = visibleCount < allProfiles.length

  // Avatar gradient based on first letter
  const getAvatarGradient = (letter: string) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-pink-600',
      'from-yellow-500 to-orange-600',
      'from-teal-500 to-green-600',
    ]
    const index = letter.charCodeAt(0) % gradients.length
    return gradients[index]
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Explore <span className="text-blue-400">Developers</span>
        </h1>
        <p className="text-blue-200 text-lg">Discover and connect with talented developers in the community</p>
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-900/40 border border-blue-700/40 rounded-full text-blue-300 text-sm">
            <Users className="h-4 w-4" />
            {allProfiles.length} developers found
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="bg-[#0a0f1c] text-blue-100 border border-blue-800/60 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">🕐 Newest</option>
          <option value="followers">👥 Most Followers</option>
          <option value="projects">📁 Most Projects</option>
        </select>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-blue-900/30 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : visibleProfiles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProfiles.map(profile => (
              <div
                key={profile.id}
                className="bg-white/5 border border-blue-900/40 backdrop-blur-sm rounded-xl hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <div className="p-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <Link to={`/profile/${profile.username}`}>
                      <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarGradient(profile.username[0])} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform`}>
                        <span className="text-white text-xl font-bold">
                          {profile.username[0].toUpperCase()}
                        </span>
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${profile.username}`}
                        className="text-lg font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                      >
                        {profile.full_name || profile.username}
                      </Link>
                      <p className="text-blue-300 text-sm">@{profile.username}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-blue-200 text-sm mb-4 line-clamp-2">{profile.bio}</p>
                  )}

                  {/* Stats Row */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 bg-blue-900/30 border border-blue-800/30 rounded-lg px-3 py-2 text-center">
                      <div className="text-white font-bold text-lg">{profile.followers_count}</div>
                      <div className="text-blue-400 text-xs">Followers</div>
                    </div>
                    <div className="flex-1 bg-blue-900/30 border border-blue-800/30 rounded-lg px-3 py-2 text-center">
                      <div className="text-white font-bold text-lg">{profile.snippet_count ?? 0}</div>
                      <div className="text-blue-400 text-xs">Snippets</div>
                    </div>
                    <div className="flex-1 bg-blue-900/30 border border-blue-800/30 rounded-lg px-3 py-2 text-center">
                      <div className="text-white font-bold text-lg">{profile.public_folders_count}</div>
                      <div className="text-blue-400 text-xs">Folders</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${profile.username}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-700/50 text-blue-200 rounded-lg hover:bg-blue-900/40 hover:border-blue-500 transition-colors text-sm font-medium"
                    >
                      <User className="h-4 w-4 mr-1.5" />
                      View Profile
                    </Link>

                    {user && user.id !== profile.id && (
                      <button
                        onClick={() => handleFollow(profile.id)}
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          followingUsers.has(profile.id)
                            ? 'bg-blue-900/40 border border-blue-700/50 text-blue-300 hover:bg-red-900/20 hover:border-red-700/40 hover:text-red-300'
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/30'
                        }`}
                      >
                        {followingUsers.has(profile.id) ? (
                          <><UserCheck className="h-4 w-4 mr-1.5" />Following</>
                        ) : (
                          <><UserPlus className="h-4 w-4 mr-1.5" />Follow</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex flex-col items-center mt-12 gap-3">
              <p className="text-blue-400 text-sm">
                Showing {visibleCount} of {allProfiles.length} developers
              </p>
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/40 hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                {loadingMore ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                ) : (
                  <><ChevronDown className="h-5 w-5" />Load More Developers</>
                )}
              </button>
            </div>
          )}

          {!hasMore && allProfiles.length > PAGE_SIZE && (
            <div className="text-center mt-10">
              <p className="text-blue-400 text-sm">
                ✅ All {allProfiles.length} developers loaded
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400 bg-blue-950/20 border border-blue-900/40 rounded-xl p-8 max-w-2xl mx-auto">
          <Users className="h-14 w-14 mx-auto text-blue-500 mb-3" />
          <h3 className="text-xl font-semibold text-white mb-2">No developers found</h3>
          <p className="text-sm text-blue-300 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'No developer profiles returned from Supabase database.'}
          </p>
          <div className="text-xs bg-black/40 p-4 rounded-lg text-left text-blue-200 space-y-2 border border-blue-800/30">
            <p className="font-bold text-yellow-400">💡 Checklist for Vercel & Supabase Data:</p>
            <p>1. <strong>Trigger Redeploy on Vercel:</strong> Go to Vercel → Deployments → Click <em>Redeploy</em> (so Vite bakes the saved env vars into the build).</p>
            <p>2. <strong>Supabase Seed Users:</strong> Run <code className="text-blue-300 font-mono">seed_indian_users.sql</code> in your Supabase SQL Editor if you haven't inserted initial users yet.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore
