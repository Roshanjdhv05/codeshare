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