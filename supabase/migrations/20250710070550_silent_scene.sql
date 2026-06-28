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