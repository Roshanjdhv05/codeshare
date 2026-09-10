export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string
          bio: string
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string
          avatar_url?: string
          bio?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string
          bio?: string
          theme?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          color?: string
          created_at?: string
        }
      }
      code_snippets: {
        Row: {
          id: string
          title: string
          description: string
          code: string
          language: string
          category_id: string | null
          author_id: string
          is_public: boolean
          views: number
          likes: number
          image_url: string
          image_description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          code: string
          language: string
          category_id?: string | null
          author_id: string
          is_public?: boolean
          views?: number
          likes?: number
          image_url?: string
          image_description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          code?: string
          language?: string
          category_id?: string | null
          author_id?: string
          is_public?: boolean
          views?: number
          likes?: number
          image_url?: string
          image_description?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      snippet_tags: {
        Row: {
          snippet_id: string
          tag_id: string
        }
        Insert: {
          snippet_id: string
          tag_id: string
        }
        Update: {
          snippet_id?: string
          tag_id?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          snippet_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snippet_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snippet_id?: string
          created_at?: string
        }
      }
      coderooms: {
        Row: {
          id: string
          title: string
          description: string
          admin_id: string
          room_code: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          admin_id: string
          room_code: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          admin_id?: string
          room_code?: string
          created_at?: string
        }
      }
      coderoom_members: {
        Row: {
          id: string
          user_id: string
          coderoom_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coderoom_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coderoom_id?: string
          joined_at?: string
        }
      }
      coderoom_posts: {
        Row: {
          id: string
          coderoom_id: string
          admin_id: string
          title: string
          content: string
          media_url: string
          media_type: string
          created_at: string
        }
        Insert: {
          id?: string
          coderoom_id: string
          admin_id: string
          title: string
          content?: string
          media_url?: string
          media_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          coderoom_id?: string
          admin_id?: string
          title?: string
          content?: string
          media_url?: string
          media_type?: string
          created_at?: string
        }
      }
      coderoom_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          comment_text: string
          parent_comment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          comment_text: string
          parent_comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          comment_text?: string
          parent_comment_id?: string | null
          created_at?: string
        }
      }
      post_media_files: {
        Row: {
          id: string
          post_id: string
          file_url: string
          file_type: 'image' | 'video' | 'file'
          file_name: string
          file_size: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          post_id: string
          file_url: string
          file_type: 'image' | 'video' | 'file'
          file_name?: string
          file_size?: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          file_url?: string
          file_type?: 'image' | 'video' | 'file'
          file_name?: string
          file_size?: number
          uploaded_at?: string
        }
      }
      user_folders: {
        Row: {
          id: string
          user_id: string
          folder_name: string
          description: string
          tags: string[]
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_name: string
          description?: string
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_name?: string
          description?: string
          tags?: string[]
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      user_files: {
        Row: {
          id: string
          folder_id: string
          user_id: string
          filename: string
          extension: string
          code_content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          folder_id: string
          user_id: string
          filename: string
          extension: string
          code_content?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          folder_id?: string
          user_id?: string
          filename?: string
          extension?: string
          code_content?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_shared_files: {
        Row: {
          id: string
          user_id: string
          post_id: string
          file_name: string
          file_url: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          file_name: string
          file_url: string
          file_type: string
          file_size?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          file_name?: string
          file_url?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'message' | 'friend_request'
          reference_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'message' | 'friend_request'
          reference_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'message' | 'friend_request'
          reference_id?: string
          is_read?: boolean
          created_at?: string
        }
      }
      saved_snippets: {
        Row: {
          id: string
          user_id: string
          snippet_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snippet_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snippet_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string
          is_private: boolean
          icon: string
          owner_id: string
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          is_private?: boolean
          icon?: string
          owner_id: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          is_private?: boolean
          icon?: string
          owner_id?: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          status: 'pending' | 'accepted' | 'invited'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'accepted' | 'invited'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          status?: 'pending' | 'accepted' | 'invited'
          invited_by?: string | null
          joined_at?: string
        }
      }
      community_messages: {
        Row: {
          id: string
          community_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_snippet_views: {
        Args: {
          snippet_uuid: string
        }
        Returns: undefined
      }
      generate_room_code: {
        Args: {}
        Returns: string
      }
      search_user_files: {
        Args: {
          search_user_id: string
          search_term: string
        }
        Returns: {
          file_id: string
          folder_id: string
          folder_name: string
          filename: string
          extension: string
          code_content: string
          created_at: string
        }[]
      }
      get_user_stats: {
        Args: {
          user_uuid: string
        }
        Returns: {
          followers_count: number
          following_count: number
          public_folders_count: number
        }[]
      }
      get_chat_participants: {
        Args: {
          user_uuid: string
        }
        Returns: {
          friend_id: string
          username: string
          full_name: string
          avatar_url: string
          last_message_content: string
          last_message_time: string
          unread_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}