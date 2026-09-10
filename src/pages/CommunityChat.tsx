import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Users,
  UserPlus,
  Shield,
  Crown,
  Lock,
  Globe,
  X,
  Search,
  Check,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/dateUtils';

interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_private: boolean;
  owner_id: string;
  member_count: number;
}

interface Member {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'accepted' | 'pending';
  profiles: {
    id: string;
    username: string;
    avatar_url?: string | null;
    full_name?: string | null;
  };
}

interface Message {
  id: string;
  community_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string | null;
    full_name?: string | null;
  };
}

export default function CommunityChat() {
  const { communityId } = useParams<{ communityId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'member' | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Invite search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [invitedUsers, setInvitedUsers] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!communityId || !user) return;

    fetchCommunityData();
    fetchMessages();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`community-messages-${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Fetch sender profile details
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, full_name')
            .eq('id', newMsg.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, profiles: profileData || { username: 'User' } },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCommunityData = async () => {
    if (!communityId || !user) return;

    try {
      setLoading(true);

      // Fetch community details
      const { data: commData, error: commError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (commError) throw commError;
      setCommunity(commData);

      // Fetch members
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('*, profiles:user_id(id, username, avatar_url, full_name)')
        .eq('community_id', communityId)
        .eq('status', 'accepted');

      if (memberError) throw memberError;
      setMembers(memberData || []);

      // Check current user's role
      const currentMember = (memberData || []).find((m: any) => m.user_id === user.id);
      if (currentMember) {
        setIsMember(true);
        setUserRole(currentMember.role);
      } else {
        setIsMember(false);
        setUserRole(null);
      }
    } catch (err) {
      console.error('Error loading community chat details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!communityId) return;

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*, profiles:sender_id(username, avatar_url, full_name)')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !communityId || !isMember) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('community_messages').insert({
        community_id: communityId,
        sender_id: user.id,
        content,
      });

      if (error) {
        console.error('Error sending message:', error);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleJoinCommunity = async () => {
    if (!user || !communityId) return;
    try {
      const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: user.id,
        role: 'member',
        status: 'accepted',
      });
      if (error) throw error;
      fetchCommunityData();
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  // Invite user search logic
  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .ilike('username', `%${query.trim()}%`)
        .limit(10);

      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleInviteUser = async (targetUserId: string) => {
    if (!user || !communityId) return;

    try {
      const { error } = await supabase.from('community_members').insert({
        community_id: communityId,
        user_id: targetUserId,
        role: 'member',
        status: 'pending',
      });

      if (error) throw error;

      setInvitedUsers((prev) => new Set(prev).add(targetUserId));
    } catch (err) {
      console.error('Error sending invite:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading chat...</span>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 flex items-center justify-center text-white p-4">
        <div className="text-center bg-black/40 border border-blue-800/30 p-8 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold mb-2">Community Not Found</h2>
          <p className="text-gray-400 text-sm mb-4">This community may have been removed or does not exist.</p>
          <button
            onClick={() => navigate('/community')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 flex flex-col text-white">
      {/* Top Header */}
      <div className="h-16 px-4 border-b border-blue-800/30 bg-black/40 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/community')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Back to Community"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-2xl">
            {community.icon}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-base leading-tight">{community.name}</h1>
              {community.is_private ? (
                <Lock className="w-3.5 h-3.5 text-purple-400" title="Private Community" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-400" title="Public Community" />
              )}
            </div>
            <p className="text-xs text-gray-400">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isMember && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          )}

          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-2 rounded-xl border transition ${
              showMembers
                ? 'bg-blue-600/30 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Members List"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Messages Section */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {!isMember ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center bg-black/40 border border-blue-800/30 p-8 rounded-2xl max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-4xl mx-auto mb-4">
                  {community.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">{community.name}</h2>
                <p className="text-gray-400 text-sm mb-6">
                  {community.description || 'You must join this community to see messages and participate in discussions.'}
                </p>
                <button
                  onClick={handleJoinCommunity}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-sm font-bold shadow-lg transition"
                >
                  Join Community
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                    <Sparkles className="w-10 h-10 text-blue-400/40 mb-2" />
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/40 flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs">
                          {msg.profiles?.avatar_url ? (
                            <img
                              src={msg.profiles.avatar_url}
                              alt={msg.profiles.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            msg.profiles?.username?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>

                        <div className={`max-w-[75%] sm:max-w-[60%] ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-baseline space-x-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className="text-xs font-semibold text-gray-300">
                              {msg.profiles?.full_name || msg.profiles?.username || 'User'}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {formatDistanceToNow(new Date(msg.created_at))}
                            </span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                                : 'bg-gray-900/90 border border-blue-800/30 text-gray-200 rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-blue-800/30 bg-black/40 backdrop-blur-md flex items-center space-x-3 shrink-0"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${community.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-blue-800/40 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </>
          )}
        </div>

        {/* Sidebar - Members List */}
        {showMembers && (
          <div className="w-64 border-l border-blue-800/30 bg-black/40 backdrop-blur-md p-4 overflow-y-auto hidden sm:block shrink-0">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
              <span>Members ({members.length})</span>
            </h3>

            <div className="space-y-3">
              {members.map((m) => (
                <div key={m.id} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition">
                  <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center overflow-hidden font-bold text-xs shrink-0">
                    {m.profiles?.avatar_url ? (
                      <img src={m.profiles.avatar_url} alt={m.profiles.username} className="w-full h-full object-cover" />
                    ) : (
                      m.profiles?.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {m.profiles?.full_name || m.profiles?.username}
                      </p>
                      {m.role === 'owner' && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Owner" />}
                      {m.role === 'admin' && <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" title="Admin" />}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">@{m.profiles?.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 border border-blue-800/40 rounded-2xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-1">Invite Members</h2>
            <p className="text-xs text-gray-400 mb-4">Search users to invite to {community.name}</p>

            <div className="relative mb-4">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-blue-800/40 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {searching ? (
                <div className="text-center py-6 text-xs text-gray-400">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  {searchQuery ? 'No users found' : 'Type to search users'}
                </div>
              ) : (
                searchResults.map((userResult) => {
                  const isAlreadyMember = members.some((m) => m.user_id === userResult.id);
                  const isInvited = invitedUsers.has(userResult.id);

                  return (
                    <div
                      key={userResult.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-900/60 border border-blue-500/30 flex items-center justify-center overflow-hidden font-bold text-xs shrink-0">
                          {userResult.avatar_url ? (
                            <img src={userResult.avatar_url} alt={userResult.username} className="w-full h-full object-cover" />
                          ) : (
                            userResult.username[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{userResult.full_name || userResult.username}</p>
                          <p className="text-[10px] text-gray-400 truncate">@{userResult.username}</p>
                        </div>
                      </div>

                      {isAlreadyMember ? (
                        <span className="text-[10px] text-gray-500 font-semibold px-2 py-1 bg-white/5 rounded-lg">
                          Member
                        </span>
                      ) : isInvited ? (
                        <span className="text-[10px] text-green-400 font-semibold flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-lg">
                          <Check className="w-3 h-3" />
                          <span>Invited</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInviteUser(userResult.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold transition"
                        >
                          Invite
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
