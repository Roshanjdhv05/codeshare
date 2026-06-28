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