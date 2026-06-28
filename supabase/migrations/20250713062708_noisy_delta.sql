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