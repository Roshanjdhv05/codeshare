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