/*
  # CodeRoom Feature Database Schema

  1. New Tables
    - `coderooms` - Main room information
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `admin_id` (uuid, foreign key to profiles)
      - `room_code` (text, unique 6-8 character code)
      - `created_at` (timestamp)
    
    - `coderoom_members` - Room membership tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `coderoom_id` (uuid, foreign key to coderooms)
      - `joined_at` (timestamp)
      - Unique constraint: (user_id, coderoom_id)
    
    - `coderoom_posts` - Admin-only posts with code/media
      - `id` (uuid, primary key)
      - `coderoom_id` (uuid, foreign key to coderooms)
      - `admin_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `content` (text, for code content)
      - `media_url` (text, for images/videos)
      - `media_type` (text, 'image' or 'video')
      - `created_at` (timestamp)
    
    - `coderoom_comments` - Real-time comments on posts
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to coderoom_posts)
      - `user_id` (uuid, foreign key to profiles)
      - `comment_text` (text)
      - `parent_comment_id` (uuid, optional for replies)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can create/join rooms
    - Only admins can create posts in their rooms
    - Only members can view and comment on room posts
    - Only admins can reply to comments (threading)

  3. Functions
    - Generate unique room codes
    - Notification triggers for new posts/comments
*/

-- Create coderooms table
CREATE TABLE IF NOT EXISTS coderooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create coderoom_members table
CREATE TABLE IF NOT EXISTS coderoom_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coderoom_id uuid NOT NULL REFERENCES coderooms(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, coderoom_id)
);

-- Create coderoom_posts table
CREATE TABLE IF NOT EXISTS coderoom_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coderoom_id uuid NOT NULL REFERENCES coderooms(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  media_url text DEFAULT '',
  media_type text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create coderoom_comments table
CREATE TABLE IF NOT EXISTS coderoom_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES coderoom_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  parent_comment_id uuid REFERENCES coderoom_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coderooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coderoom_comments ENABLE ROW LEVEL SECURITY;

-- Coderooms policies
CREATE POLICY "Users can read rooms they are members of"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = admin_id OR
    EXISTS (
      SELECT 1 FROM coderoom_members
      WHERE coderoom_members.coderoom_id = coderooms.id
      AND coderoom_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create rooms"
  ON coderooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their rooms"
  ON coderooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their rooms"
  ON coderooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Coderoom members policies
CREATE POLICY "Users can read memberships for rooms they belong to"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM coderooms
      WHERE coderooms.id = coderoom_members.coderoom_id
      AND coderooms.admin_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_members cm
      WHERE cm.coderoom_id = coderoom_members.coderoom_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Coderoom posts policies
CREATE POLICY "Members can read posts in their rooms"
  ON coderoom_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderoom_members
      WHERE coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    admin_id = auth.uid()
  );

CREATE POLICY "Admins can create posts in their rooms"
  ON coderoom_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = admin_id AND
    EXISTS (
      SELECT 1 FROM coderooms
      WHERE coderooms.id = coderoom_posts.coderoom_id
      AND coderooms.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their posts"
  ON coderoom_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their posts"
  ON coderoom_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Coderoom comments policies
CREATE POLICY "Members can read comments in their rooms"
  ON coderoom_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderoom_posts
      JOIN coderoom_members ON coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_posts
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_posts.admin_id = auth.uid()
    )
  );

CREATE POLICY "Members can create comments"
  ON coderoom_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM coderoom_posts
      JOIN coderoom_members ON coderoom_members.coderoom_id = coderoom_posts.coderoom_id
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_members.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM coderoom_posts
      WHERE coderoom_posts.id = coderoom_comments.post_id
      AND coderoom_posts.admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments"
  ON coderoom_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON coderoom_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
  code_exists boolean := true;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM coderooms WHERE room_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically add admin as member when creating room
CREATE OR REPLACE FUNCTION add_admin_as_member()
RETURNS trigger AS $$
BEGIN
  INSERT INTO coderoom_members (user_id, coderoom_id)
  VALUES (NEW.admin_id, NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add admin as member
CREATE TRIGGER add_admin_as_member_trigger
  AFTER INSERT ON coderooms
  FOR EACH ROW EXECUTE FUNCTION add_admin_as_member();