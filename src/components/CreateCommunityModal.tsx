import React, { useState } from 'react';
import { X, Lock, Globe, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const EMOJI_OPTIONS = ['💬', '🚀', '💻', '🎮', '🎨', '🔥', '🌐', '🧠', '⚡', '🎉', '📚', '🤖'];

export default function CreateCommunityModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      setError('Community name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create community
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          icon,
          is_private: isPrivate,
          owner_id: user.id,
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // 2. Add owner as member with 'owner' role and 'accepted' status
      const { error: memberError } = await supabase
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'owner',
          status: 'accepted',
        });

      if (memberError) throw memberError;

      onCreated();
    } catch (err: any) {
      console.error('Error creating community:', err);
      setError(err.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 border border-blue-800/40 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Create a Community</h2>
            <p className="text-xs text-gray-400">Build a space for developers to connect</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`h-10 text-xl flex items-center justify-center rounded-xl border transition ${
                    icon === emoji
                      ? 'bg-blue-600/30 border-blue-500 scale-105'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Community Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React Enthusiasts"
              maxLength={50}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-blue-800/40 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about?"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-blue-800/40 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm transition resize-none"
            />
          </div>

          {/* Privacy Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Privacy Setting
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                  !isPrivate
                    ? 'bg-blue-600/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${!isPrivate ? 'text-blue-400' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-semibold">Public</div>
                  <div className="text-xs text-gray-400">Anyone can join</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                  isPrivate
                    ? 'bg-purple-600/20 border-purple-500'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <Lock className={`w-5 h-5 mt-0.5 ${isPrivate ? 'text-purple-400' : 'text-gray-400'}`} />
                <div>
                  <div className="text-sm font-semibold">Private</div>
                  <div className="text-xs text-gray-400">Invite & request only</div>
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg disabled:opacity-50 transition"
            >
              {loading ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
