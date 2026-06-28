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