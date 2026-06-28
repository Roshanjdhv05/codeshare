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