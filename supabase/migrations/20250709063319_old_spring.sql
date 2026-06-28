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