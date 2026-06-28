/*
  # My Account Feature - User Folders and Files

  1. New Tables
    - `user_folders` - User-created project folders
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `folder_name` (text)
      - `description` (text, optional)
      - `tags` (text array, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_files` - Code files within folders
      - `id` (uuid, primary key)
      - `folder_id` (uuid, foreign key to user_folders)
      - `user_id` (uuid, foreign key to profiles)
      - `filename` (text)
      - `extension` (text)
      - `code_content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own folders and files
    - Policies: user_id = auth.uid()

  3. Functions
    - Auto-update timestamps
    - File search functionality
*/

-- Create user_folders table
CREATE TABLE IF NOT EXISTS user_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  folder_name text NOT NULL,
  description text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_files table
CREATE TABLE IF NOT EXISTS user_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES user_folders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  extension text NOT NULL,
  code_content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(folder_id, filename)
);

-- Enable Row Level Security
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- User folders policies
CREATE POLICY "Users can manage their own folders"
  ON user_folders
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User files policies
CREATE POLICY "Users can manage their own files"
  ON user_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp (reuse existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_user_folders_updated_at
  BEFORE UPDATE ON user_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_files_updated_at
  BEFORE UPDATE ON user_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to search files by content
CREATE OR REPLACE FUNCTION search_user_files(
  search_user_id uuid,
  search_term text
)
RETURNS TABLE (
  file_id uuid,
  folder_id uuid,
  folder_name text,
  filename text,
  extension text,
  code_content text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uf.id as file_id,
    uf.folder_id,
    ufo.folder_name,
    uf.filename,
    uf.extension,
    uf.code_content,
    uf.created_at
  FROM user_files uf
  JOIN user_folders ufo ON uf.folder_id = ufo.id
  WHERE uf.user_id = search_user_id
    AND (
      uf.filename ILIKE '%' || search_term || '%'
      OR uf.code_content ILIKE '%' || search_term || '%'
      OR ufo.folder_name ILIKE '%' || search_term || '%'
    )
  ORDER BY uf.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for search function
GRANT EXECUTE ON FUNCTION search_user_files(uuid, text) TO authenticated;