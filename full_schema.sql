/*
  # CodeShare Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `color` (text)
      - `created_at` (timestamp)
    
    - `code_snippets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `code` (text)
      - `language` (text)
      - `category_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key)
      - `is_public` (boolean)
      - `views` (integer)
      - `likes` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `snippet_tags`
      - `snippet_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - Primary key: (snippet_id, tag_id)
    
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `snippet_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - Unique constraint: (user_id, snippet_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to public snippets
    - Add policies for profile management
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create code_snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  code text NOT NULL,
  language text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_public boolean DEFAULT true,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- Create snippet_tags junction table
CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (snippet_id, tag_id)
);

ALTER TABLE snippet_tags ENABLE ROW LEVEL SECURITY;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snippet_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('JavaScript', 'JavaScript and Node.js code', '#F7DF1E'),
  ('Python', 'Python programming language', '#3776AB'),
  ('TypeScript', 'TypeScript and type definitions', '#3178C6'),
  ('React', 'React components and hooks', '#61DAFB'),
  ('CSS', 'CSS styles and animations', '#1572B6'),
  ('HTML', 'HTML markup and templates', '#E34F26'),
  ('SQL', 'Database queries and schemas', '#4479A1'),
  ('Bash', 'Shell scripts and commands', '#4EAA25'),
  ('Other', 'Other programming languages', '#6B7280')
ON CONFLICT (name) DO NOTHING;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Code snippets policies
CREATE POLICY "Public snippets are viewable by everyone"
  ON code_snippets FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own snippets"
  ON code_snippets FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own snippets"
  ON code_snippets FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own snippets"
  ON code_snippets FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own snippets"
  ON code_snippets FOR DELETE
  USING (auth.uid() = author_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Snippet tags policies
CREATE POLICY "Snippet tags are viewable by everyone"
  ON snippet_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can tag their own snippets"
  ON snippet_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_snippets 
      WHERE id = snippet_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Users can untag their own snippets"
  ON snippet_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets 
      WHERE id = snippet_id AND author_id = auth.uid()
    )
  );

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like snippets"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike snippets"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Functions to update snippet like counts
CREATE OR REPLACE FUNCTION update_snippet_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE code_snippets 
    SET likes = likes + 1 
    WHERE id = NEW.snippet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE code_snippets 
    SET likes = likes - 1 
    WHERE id = OLD.snippet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for like count updates
CREATE TRIGGER update_snippet_likes_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_snippet_likes();

-- Function to update snippet view counts
CREATE OR REPLACE FUNCTION increment_snippet_views(snippet_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE code_snippets 
  SET views = views + 1 
  WHERE id = snippet_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/*
  # Complete CodeShare Database Schema

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `bio` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories` - Code snippet categories
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, optional)
      - `color` (text, for UI theming)
      - `created_at` (timestamp)
    
    - `code_snippets` - Main code snippets table
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `code` (text, the actual code content)
      - `language` (text, programming language)
      - `category_id` (uuid, optional foreign key)
      - `author_id` (uuid, foreign key to profiles)
      - `is_public` (boolean, default true)
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tags` - Flexible tagging system
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `snippet_tags` - Many-to-many relationship
      - `snippet_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
    
    - `likes` - User likes on snippets
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `snippet_id` (uuid, foreign key to code_snippets)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to public snippets
    - Add policies for like functionality

  3. Functions
    - Function to increment snippet views
    - Trigger to update snippet likes count
    - Trigger to create user profile on signup
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

-- Create code_snippets table
CREATE TABLE IF NOT EXISTS code_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  code text NOT NULL,
  language text NOT NULL DEFAULT 'javascript',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT true,
  views integer DEFAULT 0,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create snippet_tags junction table
CREATE TABLE IF NOT EXISTS snippet_tags (
  snippet_id uuid NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (snippet_id, tag_id)
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id uuid NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snippet_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies (read-only for users)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Code snippets policies
CREATE POLICY "Anyone can read public snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can read own snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create snippets"
  ON code_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own snippets"
  ON code_snippets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own snippets"
  ON code_snippets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Tags policies
CREATE POLICY "Anyone can read tags"
  ON tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Snippet tags policies
CREATE POLICY "Anyone can read snippet tags"
  ON snippet_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tags for own snippets"
  ON snippet_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

-- Likes policies
CREATE POLICY "Users can read all likes"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('Frontend', 'HTML, CSS, JavaScript, React, Vue, Angular', '#3B82F6'),
  ('Backend', 'Node.js, Python, Java, PHP, Ruby', '#10B981'),
  ('Database', 'SQL, NoSQL, PostgreSQL, MongoDB', '#8B5CF6'),
  ('DevOps', 'Docker, Kubernetes, CI/CD, AWS', '#F59E0B'),
  ('Mobile', 'React Native, Flutter, iOS, Android', '#EF4444'),
  ('Data Science', 'Python, R, Machine Learning, Analytics', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Function to increment snippet views
CREATE OR REPLACE FUNCTION increment_snippet_views(snippet_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE code_snippets 
  SET views = views + 1 
  WHERE id = snippet_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update snippet likes count
CREATE OR REPLACE FUNCTION update_snippet_likes_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE code_snippets 
    SET likes = likes + 1 
    WHERE id = NEW.snippet_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE code_snippets 
    SET likes = likes - 1 
    WHERE id = OLD.snippet_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update likes count
DROP TRIGGER IF EXISTS update_snippet_likes_trigger ON likes;
CREATE TRIGGER update_snippet_likes_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_snippet_likes_count();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_code_snippets_updated_at ON code_snippets;
CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/*
  # Fix User Profile Creation Function

  1. Changes
    - Drop existing triggers and functions in correct order
    - Create improved function to handle new user creation
    - Set up trigger to automatically create profiles on user signup
    - Grant proper permissions

  2. Security
    - Function runs with SECURITY DEFINER for proper permissions
    - Grants execute permission to service_role
*/

-- Drop existing triggers first (in correct dependency order)
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now drop functions safely
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_profile_for_user();

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

/*
  # Add Image Support to Code Snippets

  1. Schema Changes
    - Add `image_url` column to `code_snippets` table
    - Add `image_description` column for accessibility
    - Update RLS policies to include new columns

  2. Features
    - Optional image upload/URL for code snippets
    - Toggle between image view and code view
    - Improved snippet presentation
*/

-- Add image support columns to code_snippets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN image_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'image_description'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN image_description text DEFAULT '';
  END IF;
END $$;

/*
  # CodeRoom Feature Database Schema

  1. New Tables
    - `coderooms` - Main room information
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `admin_id` (uuid, foreign key to profiles)
      - `room_code` (text, unique 6-8 character code)
      - `created_at` (timestamp)
    
    - `coderoom_members` - Room membership tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `coderoom_id` (uuid, foreign key to coderooms)
      - `joined_at` (timestamp)
      - Unique constraint: (user_id, coderoom_id)
    
    - `coderoom_posts` - Admin-only posts with code/media
      - `id` (uuid, primary key)
      - `coderoom_id` (uuid, foreign key to coderooms)
      - `admin_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `content` (text, for code content)
      - `media_url` (text, for images/videos)
      - `media_type` (text, 'image' or 'video')
      - `created_at` (timestamp)
    
    - `coderoom_comments` - Real-time comments on posts
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to coderoom_posts)
      - `user_id` (uuid, foreign key to profiles)
      - `comment_text` (text)
      - `parent_comment_id` (uuid, optional for replies)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can create/join rooms
    - Only admins can create posts in their rooms
    - Only members can view and comment on room posts
    - Only admins can reply to comments (threading)

  3. Functions
    - Generate unique room codes
    - Notification triggers for new posts/comments
*/

-- Create coderooms table
CREATE TABLE IF NOT EXISTS coderooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create coderoom_members table
CREATE TABLE IF NOT EXISTS coderoom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coderoom_id uuid NOT NULL REFERENCES coderooms(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, coderoom_id)
);

-- Create coderoom_posts table
CREATE TABLE IF NOT EXISTS coderoom_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coderoom_id uuid NOT NULL REFERENCES coderooms(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  media_url text DEFAULT '',
  media_type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create coderoom_comments table
CREATE TABLE IF NOT EXISTS coderoom_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES coderoom_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  parent_comment_id uuid REFERENCES coderoom_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coderooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_comments ENABLE ROW LEVEL SECURITY;

-- Coderooms policies
CREATE POLICY "Users can read rooms they are members of"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = admin_id OR
    EXISTS (
      SELECT 1 FROM coderoom_members
      WHERE coderoom_members.coderoom_id = coderooms.id
      AND coderoom_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create rooms"
  ON coderooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their rooms"
  ON coderooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their rooms"
  ON coderooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Coderoom members policies
CREATE POLICY "Users can read memberships for rooms they belong to"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM coderooms
      WHERE coderooms.id = coderoom_members.coderoom_id
      AND coderooms.admin_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_members cm
      WHERE cm.coderoom_id = coderoom_members.coderoom_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Coderoom posts policies
CREATE POLICY "Members can read posts in their rooms"
  ON coderoom_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderoom_members
      WHERE coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    admin_id = auth.uid()
  );

CREATE POLICY "Admins can create posts in their rooms"
  ON coderoom_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id AND
    EXISTS (
      SELECT 1 FROM coderooms
      WHERE coderooms.id = coderoom_posts.coderoom_id
      AND coderooms.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their posts"
  ON coderoom_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their posts"
  ON coderoom_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Coderoom comments policies
CREATE POLICY "Members can read comments in their rooms"
  ON coderoom_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderoom_posts
      JOIN coderoom_members ON coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_posts
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_posts.admin_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments"
  ON coderoom_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM coderoom_posts
      JOIN coderoom_members ON coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_posts
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_posts.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON coderoom_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON coderoom_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean := true;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM coderooms WHERE room_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically add admin as member when creating room
CREATE OR REPLACE FUNCTION add_admin_as_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO coderoom_members (user_id, coderoom_id)
  VALUES (NEW.admin_id, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add admin as member
CREATE TRIGGER add_admin_as_member_trigger
  AFTER INSERT ON coderooms
  FOR EACH ROW EXECUTE FUNCTION add_admin_as_member();

/*
  # Fix CodeRooms RLS policies to prevent infinite recursion

  1. Policy Changes
    - Remove problematic recursive policies on coderooms table
    - Create simplified, non-recursive policies
    - Fix coderoom_members policies to avoid conflicts

  2. Security
    - Admins can manage their own rooms
    - Members can read rooms they belong to
    - Users can manage their own memberships
    - Admins can read memberships for their rooms
*/

-- Drop ALL existing policies on coderooms to start fresh
DROP POLICY IF EXISTS "Users can read rooms they are members of" ON coderooms;
DROP POLICY IF EXISTS "Admins can delete their rooms" ON coderooms;
DROP POLICY IF EXISTS "Admins can update their rooms" ON coderooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON coderooms;

-- Drop ALL existing policies on coderoom_members to avoid conflicts
DROP POLICY IF EXISTS "Users can read memberships for rooms they belong to" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Admins can read memberships for their rooms" ON coderoom_members;

-- Create new, simpler policies for coderooms
CREATE POLICY "Admins can manage their own rooms"
  ON coderooms
  FOR ALL
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Members can read rooms they belong to"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = admin_id OR 
    auth.uid() IN (
      SELECT user_id 
      FROM coderoom_members 
      WHERE coderoom_id = coderooms.id
    )
  );

-- Create new policies for coderoom_members
CREATE POLICY "Users can read their own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read memberships for their rooms"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Policy Updates
    - Drop existing problematic policies on coderoom_members table
    - Create new, simplified policies that avoid circular references
    - Ensure policies are efficient and don't cause infinite recursion

  2. Security
    - Maintain proper access control for coderoom members
    - Allow users to read their own memberships
    - Allow admins to manage memberships in their rooms
    - Prevent unauthorized access to membership data
*/

-- Drop existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can read memberships for their rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON coderoom_members;

-- Create new, simplified policies that avoid circular references

-- Allow users to read their own membership records
CREATE POLICY "Users can view their own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own membership records (for joining rooms)
CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own membership records (for leaving rooms)
CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow room admins to view all memberships for their rooms
-- This policy avoids recursion by directly checking the coderooms table
CREATE POLICY "Room admins can view memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
    )
  );

-- Allow room admins to remove members from their rooms
CREATE POLICY "Room admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
    )
  );

/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Policy Updates
    - Drop existing problematic policies on coderoom_members table
    - Create new policies that avoid recursive references
    - Allow users to read their own memberships
    - Allow coderoom admins to read all members in their rooms

  2. Security
    - Maintain RLS protection
    - Ensure proper access control without recursion
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Room admins can view memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Room admins can remove members" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;

-- Create new SELECT policy that avoids recursion
CREATE POLICY "Users can read own memberships and admins can read their room members"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    ))
  );

-- Create INSERT policy for joining rooms
CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create DELETE policy for leaving rooms and admin removal
CREATE POLICY "Users can leave rooms and admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    ))
  );

/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "coderoom_members"
    - Occurs when querying coderoom_members table
    - Likely caused by policies that reference the same table they protect

  2. Solution
    - Drop ALL existing policies on coderoom_members
    - Create minimal, non-recursive policies
    - Use direct auth.uid() checks without subqueries where possible
    - Separate admin checks into simpler policies

  3. Security
    - Users can only see their own memberships
    - Users can only join/leave rooms for themselves
    - Admins can see memberships for their rooms (via simple subquery to coderooms)
*/

-- First, disable RLS temporarily to ensure clean slate
ALTER TABLE coderoom_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on coderoom_members to start completely fresh
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'coderoom_members' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON coderoom_members';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE coderoom_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Policy 1: Users can read their own memberships (no subqueries)
CREATE POLICY "Users can read own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own memberships (no subqueries)
CREATE POLICY "Users can insert own memberships"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can delete their own memberships (no subqueries)
CREATE POLICY "Users can delete own memberships"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 4: Admins can read memberships for their rooms (simple subquery to different table)
CREATE POLICY "Admins can read their room memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    )
  );

-- Policy 5: Admins can remove members from their rooms
CREATE POLICY "Admins can remove members from their rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    )
  );

/*
  # Fix infinite recursion in RLS policies

  1. Policy Updates
    - Remove problematic policies that cause infinite recursion
    - Create new, simplified policies that don't reference each other circularly
    - Ensure proper access control without self-referential loops

  2. Tables Affected
    - `coderooms` - Fix admin and member access policies
    - `coderoom_members` - Fix membership policies
    - `coderoom_posts` - Update policies to work with fixed coderooms policies
    - `coderoom_comments` - Update policies to work with fixed coderooms policies

  3. Security
    - Maintain proper access control
    - Ensure admins can manage their rooms
    - Ensure members can access rooms they belong to
*/

-- Drop existing problematic policies for coderooms
DROP POLICY IF EXISTS "Admins can manage their own rooms" ON coderooms;
DROP POLICY IF EXISTS "Members can read rooms they belong to" ON coderooms;

-- Drop existing problematic policies for coderoom_members
DROP POLICY IF EXISTS "Admins can read their room memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Admins can remove members from their rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can insert own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read own memberships" ON coderoom_members;

-- Drop existing problematic policies for coderoom_posts
DROP POLICY IF EXISTS "Admins can create posts in their rooms" ON coderoom_posts;
DROP POLICY IF EXISTS "Admins can delete their posts" ON coderoom_posts;
DROP POLICY IF EXISTS "Admins can update their posts" ON coderoom_posts;
DROP POLICY IF EXISTS "Members can read posts in their rooms" ON coderoom_posts;

-- Drop existing problematic policies for coderoom_comments
DROP POLICY IF EXISTS "Members can create comments" ON coderoom_comments;
DROP POLICY IF EXISTS "Members can read comments in their rooms" ON coderoom_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON coderoom_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON coderoom_comments;

-- Create new simplified policies for coderooms
CREATE POLICY "Admins can manage their rooms"
  ON coderooms
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Members can read their rooms"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid() 
    OR 
    id IN (
      SELECT coderoom_id 
      FROM coderoom_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_members
CREATE POLICY "Users can read their own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read memberships for their rooms"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_posts
CREATE POLICY "Admins can manage posts in their rooms"
  ON coderoom_posts
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (
    admin_id = auth.uid() 
    AND 
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Members can read posts in their rooms"
  ON coderoom_posts
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid()
    OR
    coderoom_id IN (
      SELECT coderoom_id 
      FROM coderoom_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_comments
CREATE POLICY "Users can manage their own comments"
  ON coderoom_comments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND
    post_id IN (
      SELECT id 
      FROM coderoom_posts 
      WHERE 
        admin_id = auth.uid()
        OR
        coderoom_id IN (
          SELECT coderoom_id 
          FROM coderoom_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Members can read comments in their rooms"
  ON coderoom_comments
  FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id 
      FROM coderoom_posts 
      WHERE 
        admin_id = auth.uid()
        OR
        coderoom_id IN (
          SELECT coderoom_id 
          FROM coderoom_members 
          WHERE user_id = auth.uid()
        )
    )
  );

/*
  # Remove CodeRoom Feature

  1. Drop Tables
    - Drop all coderoom-related tables and their dependencies
    - Remove triggers and functions related to coderooms

  2. Clean Up
    - Remove all policies, triggers, and functions
    - Drop tables in correct dependency order
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS add_admin_as_member_trigger ON coderooms;

-- Drop functions
DROP FUNCTION IF EXISTS add_admin_as_member();
DROP FUNCTION IF EXISTS generate_room_code();

-- Drop tables in dependency order (child tables first)
DROP TABLE IF EXISTS coderoom_comments CASCADE;
DROP TABLE IF EXISTS coderoom_posts CASCADE;
DROP TABLE IF EXISTS coderoom_members CASCADE;
DROP TABLE IF EXISTS coderooms CASCADE;

/*
  # My Account Feature - User Folders and Files

  1. New Tables
    - `user_folders` - User-created project folders
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `folder_name` (text)
      - `description` (text, optional)
      - `tags` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_files` - Code files within folders
      - `id` (uuid, primary key)
      - `folder_id` (uuid, foreign key to user_folders)
      - `user_id` (uuid, foreign key to profiles)
      - `filename` (text)
      - `extension` (text)
      - `code_content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own folders and files
    - Policies: user_id = auth.uid()

  3. Functions
    - Auto-update timestamps
    - File search functionality
*/

-- Create user_folders table
CREATE TABLE IF NOT EXISTS user_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_name text NOT NULL,
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_files table
CREATE TABLE IF NOT EXISTS user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES user_folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  extension text NOT NULL,
  code_content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(folder_id, filename)
);

-- Enable Row Level Security
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- User folders policies
CREATE POLICY "Users can manage their own folders"
  ON user_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User files policies
CREATE POLICY "Users can manage their own files"
  ON user_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_user_folders_updated_at
  BEFORE UPDATE ON user_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_files_updated_at
  BEFORE UPDATE ON user_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to search files by content
CREATE OR REPLACE FUNCTION search_user_files(
  search_user_id uuid,
  search_term text
)
RETURNS TABLE (
  file_id uuid,
  folder_id uuid,
  folder_name text,
  filename text,
  extension text,
  code_content text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uf.id as file_id,
    uf.folder_id,
    ufo.folder_name,
    uf.filename,
    uf.extension,
    uf.code_content,
    uf.created_at
  FROM user_files uf
  JOIN user_folders ufo ON uf.folder_id = ufo.id
  WHERE uf.user_id = search_user_id
    AND (
      uf.filename ILIKE '%' || search_term || '%'
      OR uf.code_content ILIKE '%' || search_term || '%'
      OR ufo.folder_name ILIKE '%' || search_term || '%'
    )
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for search function
GRANT EXECUTE ON FUNCTION search_user_files(uuid, text) TO authenticated;

/*
  # Social Features and Profile Updates

  1. Updates
    - Enable public access to profiles for social discovery
    - Allow public access to public code snippets
    - Update policies for categories, tags, snippet_tags, and likes
    - Add limited public access to user folder metadata
    - Maintain privacy for file contents

  2. Security
    - Public users can view profiles and public content
    - Authenticated users retain full access to their own content
    - Private content remains protected
*/

-- Update profiles policies for social features
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Allow everyone (including unauthenticated users) to read profiles for social features
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- Update code snippets policies for social features
DROP POLICY IF EXISTS "Public snippets are viewable by everyone" ON code_snippets;
DROP POLICY IF EXISTS "Anyone can read public snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can read own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can view their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can create snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can insert their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can update their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can delete own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can delete their own snippets" ON code_snippets;

-- Allow everyone (including unauthenticated users) to read public snippets
CREATE POLICY "Public snippets are viewable by everyone"
  ON code_snippets
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Anyone can read public snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can read own snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can view their own snippets"
  ON code_snippets
  FOR SELECT
  TO public
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create snippets"
  ON code_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can insert their own snippets"
  ON code_snippets
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own snippets"
  ON code_snippets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can update their own snippets"
  ON code_snippets
  FOR UPDATE
  TO public
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own snippets"
  ON code_snippets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own snippets"
  ON code_snippets
  FOR DELETE
  TO public
  USING (auth.uid() = author_id);

-- Update categories policies for social features
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Update tags policies for social features
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
DROP POLICY IF EXISTS "Users can create tags" ON tags;

CREATE POLICY "Tags are viewable by everyone"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read tags"
  ON tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can create tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update snippet_tags policies for social features
DROP POLICY IF EXISTS "Snippet tags are viewable by everyone" ON snippet_tags;
DROP POLICY IF EXISTS "Anyone can read snippet tags" ON snippet_tags;
DROP POLICY IF EXISTS "Users can manage tags for own snippets" ON snippet_tags;
DROP POLICY IF EXISTS "Users can tag their own snippets" ON snippet_tags;
DROP POLICY IF EXISTS "Users can untag their own snippets" ON snippet_tags;

CREATE POLICY "Snippet tags are viewable by everyone"
  ON snippet_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read snippet tags"
  ON snippet_tags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage tags for own snippets"
  ON snippet_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can tag their own snippets"
  ON snippet_tags
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can untag their own snippets"
  ON snippet_tags
  FOR DELETE
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

-- Update likes policies for social features
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Users can read all likes" ON likes;
DROP POLICY IF EXISTS "Authenticated users can like snippets" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
DROP POLICY IF EXISTS "Users can unlike snippets" ON likes;

CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read all likes"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can like snippets"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlike snippets"
  ON likes
  FOR DELETE
  TO public
  USING (auth.uid() = user_id);

-- Add limited public access to user_folders for social features
-- This allows viewing folder names and descriptions but not file contents
DROP POLICY IF EXISTS "Public can view folder metadata" ON user_folders;

CREATE POLICY "Public can view folder metadata"
  ON user_folders
  FOR SELECT
  TO public
  USING (true);

-- Ensure user_files remain private (no public access to file contents)
-- The existing policy "Users can manage their own files" is sufficient

-- Update the handle_new_user function to ensure proper profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/*
  # Social Features Database Migration

  1. Policy Updates
    - Update all table policies to support social features
    - Allow public access to profiles, public snippets, categories, tags, etc.
    - Maintain security for private content and user management

  2. Tables Affected
    - `profiles` - Public access for social discovery
    - `code_snippets` - Public access to public snippets
    - `categories` - Public read access
    - `tags` - Public read access
    - `snippet_tags` - Public read access
    - `likes` - Public read access
    - `user_folders` - Limited public access to metadata only

  3. Security
    - Private content remains private
    - Users can only modify their own data
    - Public content accessible to everyone
*/

-- Drop ALL existing policies to avoid conflicts

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Code snippets policies
DROP POLICY IF EXISTS "Public snippets are viewable by everyone" ON code_snippets;
DROP POLICY IF EXISTS "Anyone can read public snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can read own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can view their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can create snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can insert their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can update own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can update their own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can delete own snippets" ON code_snippets;
DROP POLICY IF EXISTS "Users can delete their own snippets" ON code_snippets;

-- Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Anyone can read categories" ON categories;

-- Tags policies
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Anyone can read tags" ON tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
DROP POLICY IF EXISTS "Users can create tags" ON tags;

-- Snippet tags policies
DROP POLICY IF EXISTS "Snippet tags are viewable by everyone" ON snippet_tags;
DROP POLICY IF EXISTS "Anyone can read snippet tags" ON snippet_tags;
DROP POLICY IF EXISTS "Users can manage tags for own snippets" ON snippet_tags;
DROP POLICY IF EXISTS "Users can tag their own snippets" ON snippet_tags;
DROP POLICY IF EXISTS "Users can untag their own snippets" ON snippet_tags;

-- Likes policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Users can read all likes" ON likes;
DROP POLICY IF EXISTS "Authenticated users can like snippets" ON likes;
DROP POLICY IF EXISTS "Users can create likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;
DROP POLICY IF EXISTS "Users can unlike snippets" ON likes;

-- User folders policies
DROP POLICY IF EXISTS "Public can view folder metadata" ON user_folders;
DROP POLICY IF EXISTS "Users can manage their own folders" ON user_folders;

-- CREATE NEW POLICIES FOR SOCIAL FEATURES

-- Profiles policies - Allow public access for social discovery
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Code snippets policies - Public snippets viewable by everyone
CREATE POLICY "Public snippets are viewable by everyone"
  ON code_snippets
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can view their own snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own snippets"
  ON code_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own snippets"
  ON code_snippets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own snippets"
  ON code_snippets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Categories policies - Public read access
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

-- Tags policies - Public read access
CREATE POLICY "Tags are viewable by everyone"
  ON tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Snippet tags policies - Public read access
CREATE POLICY "Snippet tags are viewable by everyone"
  ON snippet_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can tag their own snippets"
  ON snippet_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can untag their own snippets"
  ON snippet_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = snippet_tags.snippet_id
      AND code_snippets.author_id = auth.uid()
    )
  );

-- Likes policies - Public read access
CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User folders policies - Limited public access to metadata only
CREATE POLICY "Public can view folder metadata"
  ON user_folders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their own folders"
  ON user_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure user_files remain private (existing policy should be sufficient)
-- But let's make sure it exists
DROP POLICY IF EXISTS "Users can manage their own files" ON user_files;

CREATE POLICY "Users can manage their own files"
  ON user_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Update the handle_new_user function to ensure proper profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_user_meta_data->>'bio', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

/*
  # Add Social Features and Profile Updates

  1. Schema Changes
    - Add `is_public` column to `user_folders` table
    - Create `user_followers` table for follow relationships
    - Update RLS policies for social features

  2. New Tables
    - `user_followers` - Track follow relationships between users

  3. Security
    - Update RLS policies to support public/private folders
    - Add policies for follow relationships
    - Ensure proper access control for social features
*/

-- Add is_public column to user_folders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_folders' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE user_folders ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Create user_followers table
CREATE TABLE IF NOT EXISTS user_followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable Row Level Security
ALTER TABLE user_followers ENABLE ROW LEVEL SECURITY;

-- Update user_folders policies for public/private visibility
DROP POLICY IF EXISTS "Public can view folder metadata" ON user_folders;
DROP POLICY IF EXISTS "Users can manage their own folders" ON user_folders;

-- New policies for user_folders with public/private support
CREATE POLICY "Users can manage their own folders"
  ON user_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view public folder metadata"
  ON user_folders
  FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Authenticated users can view public folders"
  ON user_folders
  FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

-- Policies for user_followers
CREATE POLICY "Users can view all follow relationships"
  ON user_followers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create follow relationships"
  ON user_followers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follow relationships"
  ON user_followers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Function to get follower/following counts
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid uuid)
RETURNS TABLE (
  followers_count bigint,
  following_count bigint,
  public_folders_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM user_followers WHERE following_id = user_uuid) as followers_count,
    (SELECT COUNT(*) FROM user_followers WHERE follower_id = user_uuid) as following_count,
    (SELECT COUNT(*) FROM user_folders WHERE user_id = user_uuid AND is_public = true) as public_folders_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats(uuid) TO anon;

/*
  # Update Folders RLS Policies

  1. Security Updates
    - Ensure proper RLS policies for user_folders table
    - Allow users to read their own folders or public folders
    - Allow users to update their own folders only
    - Prevent unauthorized access to private folders

  2. Changes
    - Update existing RLS policies if needed
    - Ensure folder privacy is properly enforced
*/

-- Ensure RLS is enabled on user_folders
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them
DROP POLICY IF EXISTS "Users can read own or public folders" ON user_folders;
DROP POLICY IF EXISTS "Users can update own folders" ON user_folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON user_folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON user_folders;

-- Allow users to read their own folders or public folders from others
CREATE POLICY "Users can read own or public folders"
  ON user_folders FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

-- Allow users to update their own folders only
CREATE POLICY "Users can update own folders"
  ON user_folders FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own folders only
CREATE POLICY "Users can delete own folders"
  ON user_folders FOR DELETE
  USING (user_id = auth.uid());

-- Allow users to insert folders for themselves only
CREATE POLICY "Users can insert own folders"
  ON user_folders FOR INSERT
  WITH CHECK (user_id = auth.uid());

/*
  # Enhanced RLS Policies for Follow-to-View Feature

  1. Security Updates
    - Update code_snippets policies to require following for viewing others' code
    - Update user_folders policies to require following for accessing others' folders
    - Update user_files policies to require following for accessing others' files
    
  2. Policy Changes
    - Allow users to view their own content always
    - Allow users to view public content only if they follow the author
    - Maintain existing admin/owner permissions
*/

-- Drop existing policies for code_snippets
DROP POLICY IF EXISTS "Public snippets are viewable by everyone" ON code_snippets;
DROP POLICY IF EXISTS "Users can view their own snippets" ON code_snippets;

-- Create new policies for code_snippets with follow-to-view logic
CREATE POLICY "Users can view own snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Followers can view public snippets"
  ON code_snippets
  FOR SELECT
  TO authenticated
  USING (
    is_public = true AND (
      author_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_followers
        WHERE follower_id = auth.uid() AND following_id = author_id
      )
    )
  );

-- Update user_folders policies
DROP POLICY IF EXISTS "Authenticated users can view public folders" ON user_folders;
DROP POLICY IF EXISTS "Public can view public folder metadata" ON user_folders;

CREATE POLICY "Users can view own folders"
  ON user_folders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Followers can view public folders"
  ON user_folders
  FOR SELECT
  TO authenticated
  USING (
    is_public = true AND (
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM user_followers
        WHERE follower_id = auth.uid() AND following_id = user_id
      )
    )
  );

-- Update user_files policies
CREATE POLICY "Followers can view files in accessible folders"
  ON user_files
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_folders uf
      WHERE uf.id = folder_id AND (
        uf.user_id = auth.uid() OR
        (uf.is_public = true AND EXISTS (
          SELECT 1 FROM user_followers
          WHERE follower_id = auth.uid() AND following_id = uf.user_id
        ))
      )
    )
  );

-- Ensure proper indexing for performance
CREATE INDEX IF NOT EXISTS idx_user_followers_follower_following 
  ON user_followers(follower_id, following_id);

CREATE INDEX IF NOT EXISTS idx_code_snippets_author_public 
  ON code_snippets(author_id, is_public);

CREATE INDEX IF NOT EXISTS idx_user_folders_user_public 
  ON user_folders(user_id, is_public);

/*
  # Update RLS Policies for Public Code Access

  1. Policy Updates
    - Allow public access to public folders for all users (including unauthenticated)
    - Allow public access to files in public folders for all users
    - Remove follow-to-view restrictions for public content

  2. Security
    - Maintain owner access to all their content
    - Public folders and files are accessible to everyone
    - Private content remains protected
*/

-- Drop existing policies that require following
DROP POLICY IF EXISTS "Followers can view public folders" ON user_folders;
DROP POLICY IF EXISTS "Followers can view files in accessible folders" ON user_files;

-- Update user_folders policies for public access
CREATE POLICY "Allow read of public folders"
ON user_folders
FOR SELECT
USING (
  is_public = true OR user_id = auth.uid()
);

-- Update user_files policies for public access
CREATE POLICY "Allow read of files in public folders"
ON user_files
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_folders
    WHERE user_folders.id = user_files.folder_id
    AND user_folders.is_public = true
  ) OR user_id = auth.uid()
);

-- Update code_snippets policy for public access (remove follow requirement)
DROP POLICY IF EXISTS "Followers can view public snippets" ON code_snippets;

CREATE POLICY "Allow read of public snippets"
ON code_snippets
FOR SELECT
USING (
  is_public = true OR author_id = auth.uid()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_folders_public ON user_folders(is_public, user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_folder_user ON user_files(folder_id, user_id);
CREATE INDEX IF NOT EXISTS idx_code_snippets_public ON code_snippets(is_public, author_id);

/*
  # Add shared files support for posts

  1. New Tables
    - `user_shared_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references code_snippets)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_shared_files` table
    - Add policies for CRUD operations
    - Allow public read access for files in public posts

  3. Storage
    - Create storage bucket for shared files
    - Set up file type and size restrictions
*/

-- Create user_shared_files table
CREATE TABLE IF NOT EXISTS user_shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_shared_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_shared_files
CREATE POLICY "Users can manage their own shared files"
  ON user_shared_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow read of shared files in public posts"
  ON user_shared_files
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = user_shared_files.post_id
      AND code_snippets.is_public = true
    )
  );

-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-files', 'shared-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view public shared files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shared-files');

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_shared_files_post_id ON user_shared_files(post_id);
CREATE INDEX IF NOT EXISTS idx_user_shared_files_user_id ON user_shared_files(user_id);

/*
  # Add theme preference to profiles table

  1. Changes
    - Add `theme` column to `profiles` table with default 'light'
    - Allow users to store their preferred theme (light/dark)

  2. Security
    - Users can update their own theme preference
    - Theme preference is readable by the profile owner
*/

-- Add theme column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'theme'
  ) THEN
    ALTER TABLE profiles ADD COLUMN theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark'));
  END IF;
END $$;

/*
  # Real-Time Chat System

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `status` (text: 'pending' | 'accepted' | 'rejected')
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text: 'message' | 'friend_request')
      - `reference_id` (uuid)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
    - Only involved users can access their data

  3. Indexes
    - Optimize for chat queries
    - Friend lookup performance
    - Notification retrieval
*/

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'friend_request')),
  reference_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view friendships they're involved in"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update friendships they're involved in"
  ON friendships
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_sender ON friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Function to get chat participants
CREATE OR REPLACE FUNCTION get_chat_participants(user_uuid uuid)
RETURNS TABLE (
  friend_id uuid,
  username text,
  full_name text,
  avatar_url text,
  last_message_content text,
  last_message_time timestamptz,
  unread_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    CASE 
      WHEN f.sender_id = user_uuid THEN f.receiver_id
      ELSE f.sender_id
    END as friend_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(latest_msg.content, '') as last_message_content,
    latest_msg.created_at as last_message_time,
    COALESCE(unread.count, 0) as unread_count
  FROM friendships f
  JOIN profiles p ON (
    CASE 
      WHEN f.sender_id = user_uuid THEN p.id = f.receiver_id
      ELSE p.id = f.sender_id
    END
  )
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages m
    WHERE (
      (m.sender_id = user_uuid AND m.receiver_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END) OR
      (m.receiver_id = user_uuid AND m.sender_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END)
    )
    ORDER BY created_at DESC
    LIMIT 1
  ) latest_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM notifications n
    WHERE n.user_id = user_uuid 
      AND n.type = 'message'
      AND n.is_read = false
      AND EXISTS (
        SELECT 1 FROM messages msg 
        WHERE msg.id::text = n.reference_id::text 
          AND msg.sender_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END
      )
  ) unread ON true
  WHERE f.status = 'accepted'
    AND (f.sender_id = user_uuid OR f.receiver_id = user_uuid)
  ORDER BY COALESCE(latest_msg.created_at, f.created_at) DESC;
END;
$$;

/*
  # Add saved snippets functionality

  1. New Tables
    - `saved_snippets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `snippet_id` (uuid, foreign key to code_snippets)
      - `created_at` (timestamp)
      - Unique constraint on (user_id, snippet_id)

  2. Security
    - Enable RLS on `saved_snippets` table
    - Add policies for users to manage their own saved snippets
    - Add policy for users to view their own saved snippets
*/

CREATE TABLE IF NOT EXISTS saved_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  snippet_id uuid REFERENCES code_snippets(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snippet_id)
);

ALTER TABLE saved_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved snippets"
  ON saved_snippets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own saved snippets"
  ON saved_snippets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_snippets_user_id ON saved_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_snippets_snippet_id ON saved_snippets(snippet_id);

