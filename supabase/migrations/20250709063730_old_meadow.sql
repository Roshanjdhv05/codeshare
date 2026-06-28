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