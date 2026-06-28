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