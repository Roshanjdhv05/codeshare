/*
  # Add shared files support for posts

  1. New Tables
    - `user_shared_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references code_snippets)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_shared_files` table
    - Add policies for CRUD operations
    - Allow public read access for files in public posts

  3. Storage
    - Create storage bucket for shared files
    - Set up file type and size restrictions
*/

-- Create user_shared_files table
CREATE TABLE IF NOT EXISTS user_shared_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_shared_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_shared_files
CREATE POLICY "Users can manage their own shared files"
  ON user_shared_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow read of shared files in public posts"
  ON user_shared_files
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM code_snippets
      WHERE code_snippets.id = user_shared_files.post_id
      AND code_snippets.is_public = true
    )
  );

-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-files', 'shared-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view public shared files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'shared-files');

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'shared-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_shared_files_post_id ON user_shared_files(post_id);
CREATE INDEX IF NOT EXISTS idx_user_shared_files_user_id ON user_shared_files(user_id);