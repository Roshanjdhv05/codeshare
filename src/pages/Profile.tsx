import React, { useState, useEffect } from 'react';
import { User, Code, Folder, Bookmark, Edit3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PostCard } from '../components/PostCard';
import { FolderTreeView } from '../components/FolderTreeView';
import { useSavedSnippets } from '../hooks/useSavedSnippets';
import { useToast } from '../hooks/useToast';

export const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'folders' | 'saved'>('dashboard');
  const [userSnippets, setUserSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    bio: profile?.bio || ''
  });

  const { savedSnippets, loading: savedLoading } = useSavedSnippets();

  useEffect(() => {
    fetchUserSnippets();
  }, [user]);

  const fetchUserSnippets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserSnippets(data || []);
    } catch (error) {
      console.error('Error fetching user snippets:', error);
      showToast('Failed to load your snippets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile(formData);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please sign in to view your profile
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="text-2xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                      placeholder="Username"
                    />
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-gray-300"
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile?.username || user.email}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {profile?.bio || 'No bio yet'}
                    </p>
                  </>
                )}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>My Snippets</span>
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'folders'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>My Folders</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                activeTab === 'saved'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Snippets</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  My Code Snippets
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {userSnippets.length} snippet{userSnippets.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userSnippets.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No snippets yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't created any code snippets yet. Start sharing your code!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {userSnippets.map((snippet) => (
                    <PostCard key={snippet.id} snippet={snippet} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'folders' && (
            <div className="space-y-6">
              <FolderTreeView />
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Saved Snippets
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {savedSnippets.length} snippet{savedSnippets.length !== 1 ? 's' : ''}
                </span>
              </div>

              {savedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : savedSnippets.length === 0 ? (
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No saved snippets yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't saved any snippets yet. Start exploring and save your favorites!
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {savedSnippets.map((savedSnippet) => (
                    <PostCard
                      key={savedSnippet.id}
                      snippet={savedSnippet.code_snippets}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};