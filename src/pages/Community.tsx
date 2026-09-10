import React, { useState, useEffect, useCallback } from 'react'
import {
  Users, UserPlus, MessageCircle, Search, Check, X,
  Globe, Lock, Plus, Crown, Hash, Bell, UserCheck,
  LogIn, Send
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from '../utils/dateUtils'
import { useDebounce } from '../hooks/useDebounce'
import CreateCommunityModal from '../components/CreateCommunityModal'

type Profile = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
}

type Follow = {
  id: string
  follower_id: string
  following_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

type Community = {
  id: string
  name: string
  description: string
  is_private: boolean
  avatar_emoji: string
  owner_id: string
  member_count: number
  created_at: string
  owner?: Profile
  myMembership?: { status: string; role: string } | null
}

type TabType = 'people' | 'friends' | 'communities' | 'requests'

const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
]
const avatarColor = (id: string) =>
  AVATAR_COLORS[id.charCodeAt(0) % AVATAR_COLORS.length]

// ─────────────────────────────────────────────
const Community: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<TabType>('people')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 400)

  // People tab
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [myFollows, setMyFollows] = useState<Follow[]>([])
  const [loadingPeople, setLoadingPeople] = useState(false)

  // Friends tab (mutual follows)
  const [mutualFriends, setMutualFriends] = useState<Profile[]>([])

  // Communities tab
  const [communities, setCommunities] = useState<Community[]>([])
  const [loadingCommunities, setLoadingCommunities] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Requests tab
  const [followRequests, setFollowRequests] = useState<(Follow & { sender: Profile })[]>([])
  const [communityInvites, setCommunityInvites] = useState<{
    id: string; community: Community; invited_by_profile: Profile
  }[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  // ── fetch helpers ──────────────────────────────────────
  const fetchFollows = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('follows')
      .select('*')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`)
    setMyFollows((data as Follow[]) || [])
  }, [user])

  const fetchPeople = useCallback(async () => {
    if (!user) return
    setLoadingPeople(true)
    const query = supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .neq('id', user.id)
      .limit(40)

    if (debouncedSearch.trim()) {
      query.or(
        `username.ilike.%${debouncedSearch}%,full_name.ilike.%${debouncedSearch}%`
      )
    }
    const { data } = await query
    setAllUsers((data as Profile[]) || [])
    setLoadingPeople(false)
  }, [user, debouncedSearch])

  const fetchMutualFriends = useCallback(async () => {
    if (!user) return
    // People I follow AND who follow me back — both accepted
    const iFollow = myFollows
      .filter(f => f.follower_id === user.id && f.status === 'accepted')
      .map(f => f.following_id)
    const followMe = myFollows
      .filter(f => f.following_id === user.id && f.status === 'accepted')
      .map(f => f.follower_id)
    const mutualIds = iFollow.filter(id => followMe.includes(id))
    if (mutualIds.length === 0) { setMutualFriends([]); return }
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .in('id', mutualIds)
    setMutualFriends((data as Profile[]) || [])
  }, [user, myFollows])

  const fetchCommunities = useCallback(async () => {
    if (!user) return
    setLoadingCommunities(true)
    const { data: comms } = await supabase
      .from('communities')
      .select('*, owner:profiles!communities_owner_id_fkey(id,username,full_name,avatar_url,bio)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (!comms) { setCommunities([]); setLoadingCommunities(false); return }

    // Fetch my memberships
    const { data: memberships } = await supabase
      .from('community_members')
      .select('community_id, status, role')
      .eq('user_id', user.id)

    const memberMap = new Map(
      (memberships || []).map(m => [m.community_id, { status: m.status, role: m.role }])
    )

    const enriched: Community[] = comms.map((c: any) => ({
      ...c,
      owner: c.owner as Profile,
      myMembership: memberMap.get(c.id) || null,
    }))
    setCommunities(enriched)
    setLoadingCommunities(false)
  }, [user])

  const fetchRequests = useCallback(async () => {
    if (!user) return
    setLoadingRequests(true)

    // Follow requests directed at me (pending)
    const { data: fReqs } = await supabase
      .from('follows')
      .select('*, sender:profiles!follows_follower_id_fkey(id,username,full_name,avatar_url,bio)')
      .eq('following_id', user.id)
      .eq('status', 'pending')
    setFollowRequests((fReqs as any[]) || [])

    // Community invites for me
    const { data: invites } = await supabase
      .from('community_members')
      .select(`
        id,
        community:communities(id,name,description,is_private,avatar_emoji,owner_id,member_count,created_at,updated_at),
        invited_by_profile:profiles!community_members_invited_by_fkey(id,username,full_name,avatar_url,bio)
      `)
      .eq('user_id', user.id)
      .eq('status', 'invited')
    setCommunityInvites((invites as any[]) || [])

    setLoadingRequests(false)
  }, [user])

  // ── initial load ───────────────────────────────────────
  useEffect(() => { fetchFollows() }, [fetchFollows])
  useEffect(() => { if (activeTab === 'people') fetchPeople() }, [activeTab, fetchPeople])
  useEffect(() => { if (activeTab === 'friends') fetchMutualFriends() }, [activeTab, fetchMutualFriends])
  useEffect(() => { if (activeTab === 'communities') fetchCommunities() }, [activeTab, fetchCommunities])
  useEffect(() => { if (activeTab === 'requests') fetchRequests() }, [activeTab, fetchRequests])
  useEffect(() => { if (activeTab === 'people') fetchPeople() }, [debouncedSearch])

  // ── follow actions ─────────────────────────────────────
  const getFollowStatus = (targetId: string) => {
    const sent = myFollows.find(f => f.follower_id === user?.id && f.following_id === targetId)
    if (sent) return sent.status === 'accepted' ? 'following' : 'pending'
    return 'none'
  }

  const sendFollowRequest = async (targetId: string) => {
    if (!user) return
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetId })
    await fetchFollows()
    await fetchPeople()
  }

  const unfollow = async (targetId: string) => {
    if (!user) return
    await supabase.from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
    await fetchFollows()
    await fetchPeople()
  }

  const respondToFollowRequest = async (followId: string, action: 'accepted' | 'rejected') => {
    await supabase.from('follows').update({ status: action }).eq('id', followId)
    await fetchFollows()
    await fetchRequests()
  }

  // ── community actions ──────────────────────────────────
  const joinCommunity = async (communityId: string) => {
    if (!user) return
    await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
      status: 'accepted',
    })
    await fetchCommunities()
  }

  const leaveCommunity = async (communityId: string) => {
    if (!user) return
    await supabase.from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id)
    await fetchCommunities()
  }

  const respondToInvite = async (membershipId: string, communityId: string, accept: boolean) => {
    if (accept) {
      await supabase.from('community_members')
        .update({ status: 'accepted' })
        .eq('id', membershipId)
    } else {
      await supabase.from('community_members')
        .delete()
        .eq('id', membershipId)
    }
    await fetchRequests()
    await fetchCommunities()
  }

  const handleCommunityCreated = async () => {
    setShowCreateModal(false)
    await fetchCommunities()
  }

  // ── pending request badge count ─────────────────────────
  const requestCount = followRequests.length + communityInvites.length

  // ── tabs config ────────────────────────────────────────
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'people', label: 'People', icon: <Users className="h-4 w-4" /> },
    { id: 'friends', label: 'Friends', icon: <UserCheck className="h-4 w-4" />, badge: mutualFriends.length },
    { id: 'communities', label: 'Communities', icon: <Hash className="h-4 w-4" /> },
    { id: 'requests', label: 'Requests', icon: <Bell className="h-4 w-4" />, badge: requestCount || undefined },
  ]

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-blue-950/40 border border-blue-800/40 rounded-2xl p-10 backdrop-blur-xl">
          <Users className="h-16 w-16 mx-auto text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Join the Community</h2>
          <p className="text-gray-400 mb-6">Sign in to discover developers, follow people, and join communities.</p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium">Sign In</Link>
            <Link to="/register" className="px-6 py-2.5 border border-blue-700 text-blue-300 rounded-xl hover:bg-blue-900/40 transition font-medium">Sign Up</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <span className="text-2xl">🌐</span> Community
        </h1>
        <p className="mt-1 text-gray-400">Discover developers, connect with friends, and build communities.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-blue-950/40 backdrop-blur border border-blue-800/40 rounded-2xl mb-8 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm('') }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center
              ${activeTab === tab.id
                ? 'bg-blue-600/80 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                : 'text-gray-400 hover:text-white hover:bg-blue-900/40'
              }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── PEOPLE TAB ─── */}
      {activeTab === 'people' && (
        <div>
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none backdrop-blur"
            />
          </div>

          {loadingPeople ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-blue-950/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map(profile => {
                const status = getFollowStatus(profile.id)
                return (
                  <div key={profile.id}
                    className="bg-black/30 border border-blue-800/30 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-600/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(profile.id)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow`}>
                        {profile.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{profile.full_name || profile.username}</p>
                        <p className="text-sm text-gray-400 truncate">@{profile.username}</p>
                      </div>
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{profile.bio}</p>
                    )}
                    <div className="flex gap-2">
                      <Link to={`/profile/${profile.username}`}
                        className="flex-1 text-center text-xs py-1.5 rounded-lg border border-blue-800/50 text-gray-300 hover:bg-blue-900/40 transition">
                        View Profile
                      </Link>
                      {status === 'none' && (
                        <button onClick={() => sendFollowRequest(profile.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">
                          <UserPlus className="h-3.5 w-3.5" /> Follow
                        </button>
                      )}
                      {status === 'pending' && (
                        <span className="px-3 py-1.5 bg-yellow-600/20 text-yellow-300 text-xs rounded-lg border border-yellow-700/40">
                          Pending
                        </span>
                      )}
                      {status === 'following' && (
                        <button onClick={() => unfollow(profile.id)}
                          className="px-3 py-1.5 bg-green-600/20 text-green-300 text-xs rounded-lg border border-green-700/40 hover:bg-red-600/20 hover:text-red-300 hover:border-red-700/40 transition">
                          Following
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {allUsers.length === 0 && !loadingPeople && (
                <div className="col-span-3 text-center py-16 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No users found{searchTerm ? ` for "${searchTerm}"` : ''}.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── FRIENDS TAB ─── */}
      {activeTab === 'friends' && (
        <div>
          <p className="text-sm text-gray-400 mb-6">
            People you follow who also follow you back — you can DM each other.
          </p>
          {mutualFriends.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="mb-4">No mutual connections yet.</p>
              <button onClick={() => setActiveTab('people')}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm">
                Discover People
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mutualFriends.map(friend => (
                <div key={friend.id}
                  className="bg-black/30 border border-blue-800/30 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-600/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(friend.id)} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow`}>
                      {friend.username[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{friend.full_name || friend.username}</p>
                      <p className="text-sm text-gray-400 truncate">@{friend.username}</p>
                    </div>
                  </div>
                  {friend.bio && (
                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{friend.bio}</p>
                  )}
                  <div className="flex gap-2">
                    <Link to={`/profile/${friend.username}`}
                      className="flex-1 text-center text-xs py-1.5 rounded-lg border border-blue-800/50 text-gray-300 hover:bg-blue-900/40 transition">
                      Profile
                    </Link>
                    <Link to={`/chat/${friend.id}`}
                      className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">
                      <MessageCircle className="h-3.5 w-3.5" /> Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── COMMUNITIES TAB ─── */}
      {activeTab === 'communities' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-400">Join public communities or create your own.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Plus className="h-4 w-4" /> Create Community
            </button>
          </div>

          {loadingCommunities ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-52 rounded-2xl bg-blue-950/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map(community => {
                const mem = community.myMembership
                const isOwner = community.owner_id === user?.id
                const isMember = mem?.status === 'accepted'

                return (
                  <div key={community.id}
                    className="bg-black/30 border border-blue-800/30 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-600/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-900/60 border border-blue-700/40 flex items-center justify-center text-2xl shrink-0">
                        {community.avatar_emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-white truncate">{community.name}</p>
                          {community.is_private
                            ? <Lock className="h-3 w-3 text-gray-500 shrink-0" />
                            : <Globe className="h-3 w-3 text-blue-400 shrink-0" />}
                          {isOwner && <Crown className="h-3 w-3 text-yellow-400 shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400">{community.member_count} member{community.member_count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {community.description && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">{community.description}</p>
                    )}
                    <div className="mt-auto flex gap-2">
                      {isMember || isOwner ? (
                        <>
                          <button
                            onClick={() => navigate(`/community/chat/${community.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition">
                            <MessageCircle className="h-3.5 w-3.5" /> Open Chat
                          </button>
                          {!isOwner && (
                            <button
                              onClick={() => leaveCommunity(community.id)}
                              className="px-3 py-1.5 text-xs text-red-400 border border-red-800/40 rounded-lg hover:bg-red-900/30 transition">
                              Leave
                            </button>
                          )}
                        </>
                      ) : community.is_private ? (
                        <span className="flex-1 text-center text-xs py-1.5 text-gray-500 border border-gray-700/40 rounded-lg">
                          <Lock className="h-3 w-3 inline mr-1" /> Invite Only
                        </span>
                      ) : (
                        <button
                          onClick={() => joinCommunity(community.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600/80 text-white text-xs rounded-lg hover:bg-emerald-600 transition">
                          <LogIn className="h-3.5 w-3.5" /> Join
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {communities.length === 0 && !loadingCommunities && (
                <div className="col-span-3 text-center py-16 text-gray-500">
                  <Hash className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p className="mb-4">No communities yet. Be the first to create one!</p>
                  <button onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm">
                    Create Community
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── REQUESTS TAB ─── */}
      {activeTab === 'requests' && (
        <div className="space-y-8">
          {/* Follow Requests */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-400" />
              Follow Requests
              {followRequests.length > 0 && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">{followRequests.length}</span>
              )}
            </h2>
            {loadingRequests ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-blue-950/30 animate-pulse" />)}
              </div>
            ) : followRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-blue-950/20 rounded-2xl border border-blue-900/30">
                <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending follow requests</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {followRequests.map(req => (
                  <div key={req.id}
                    className="bg-black/30 border border-blue-700/40 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(req.sender.id)} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {req.sender.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{req.sender.full_name || req.sender.username}</p>
                      <p className="text-xs text-gray-400">@{req.sender.username}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => respondToFollowRequest(req.id, 'accepted')}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => respondToFollowRequest(req.id, 'rejected')}
                        className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Community Invites */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Hash className="h-5 w-5 text-purple-400" />
              Community Invites
              {communityInvites.length > 0 && (
                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">{communityInvites.length}</span>
              )}
            </h2>
            {loadingRequests ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-blue-950/30 animate-pulse" />)}
              </div>
            ) : communityInvites.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-blue-950/20 rounded-2xl border border-blue-900/30">
                <Hash className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending community invites</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communityInvites.map(invite => (
                  <div key={invite.id}
                    className="bg-black/30 border border-purple-700/40 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-700/40 flex items-center justify-center text-2xl shrink-0">
                      {invite.community.avatar_emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{invite.community.name}</p>
                      <p className="text-xs text-gray-400">
                        Invited by @{invite.invited_by_profile?.username}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {invite.community.is_private
                          ? <><Lock className="h-3 w-3 text-gray-500" /><span className="text-xs text-gray-500">Private</span></>
                          : <><Globe className="h-3 w-3 text-blue-400" /><span className="text-xs text-gray-500">Public</span></>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => respondToInvite(invite.id, invite.community.id, true)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => respondToInvite(invite.id, invite.community.id, false)}
                        className="p-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700 transition">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <CreateCommunityModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCommunityCreated}
        />
      )}
    </div>
  )
}

export default Community
