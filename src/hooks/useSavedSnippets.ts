import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';

export interface SavedSnippet {
  id: string;
  user_id: string;
  snippet_id: string;
  created_at: string;
  code_snippets: {
    id: string;
    title: string;
    description: string;
    code: string;
    language: string;
    author_id: string;
    is_public: boolean;
    views: number;
    likes: number;
    created_at: string;
    updated_at: string;
    image_url: string;
    image_description: string;
    profiles: {
      id: string;
      username: string;
      full_name: string;
      avatar_url: string;
    };
  };
}

export const useSavedSnippets = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSnippetIds, setSavedSnippetIds] = useState<Set<string>>(new Set());

  // Fetch saved snippets for the current user
  const fetchSavedSnippets = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_snippets')
        .select(`
          id,
          user_id,
          snippet_id,
          created_at,
          code_snippets (
            id,
            title,
            description,
            code,
            language,
            author_id,
            is_public,
            views,
            likes,
            created_at,
            updated_at,
            image_url,
            image_description,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedSnippets(data || []);
      setSavedSnippetIds(new Set(data?.map(item => item.snippet_id) || []));
    } catch (error) {
      console.error('Error fetching saved snippets:', error);
      showToast('Failed to load saved snippets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle save/unsave a snippet
  const toggleSaveSnippet = async (snippetId: string): Promise<{ success: boolean; action?: 'saved' | 'unsaved' }> => {
    if (!user) {
      showToast('Please sign in to save snippets', 'error');
      return { success: false };
    }

    try {
      const isSaved = savedSnippetIds.has(snippetId);

      if (isSaved) {
        // Remove from saved snippets
        const { error } = await supabase
          .from('saved_snippets')
          .delete()
          .eq('user_id', user.id)
          .eq('snippet_id', snippetId);

        if (error) throw error;

        setSavedSnippetIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(snippetId);
          return newSet;
        });

        setSavedSnippets(prev => prev.filter(item => item.snippet_id !== snippetId));
        return { success: true, action: 'unsaved' };
      } else {
        // Add to saved snippets
        const { error } = await supabase
          .from('saved_snippets')
          .insert({
            user_id: user.id,
            snippet_id: snippetId
          });

        if (error) throw error;

        setSavedSnippetIds(prev => new Set([...prev, snippetId]));

        // Refresh the saved snippets list to get the new item
        fetchSavedSnippets();
        return { success: true, action: 'saved' };
      }
    } catch (error) {
      console.error('Error toggling save snippet:', error);
      return { success: false };
    }
  };

  // Check if a snippet is saved
  const isSnippetSaved = (snippetId: string) => {
    return savedSnippetIds.has(snippetId);
  };

  useEffect(() => {
    fetchSavedSnippets();
  }, [user]);

  return {
    savedSnippets,
    loading,
    toggleSaveSnippet,
    isSnippetSaved,
    refetch: fetchSavedSnippets
  };
};