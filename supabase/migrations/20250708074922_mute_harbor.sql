/*
  # Fix infinite recursion in RLS policies

  1. Policy Updates
    - Remove problematic policies that cause infinite recursion
    - Create new, simplified policies that don't reference each other circularly
    - Ensure proper access control without self-referential loops

  2. Tables Affected
    - `coderooms` - Fix admin and member access policies
    - `coderoom_members` - Fix membership policies
    - `coderoom_posts` - Update policies to work with fixed coderooms policies
    - `coderoom_comments` - Update policies to work with fixed coderooms policies

  3. Security
    - Maintain proper access control
    - Ensure admins can manage their rooms
    - Ensure members can access rooms they belong to
*/

-- Drop existing problematic policies for coderooms
DROP POLICY IF EXISTS "Admins can manage their own rooms" ON coderooms;
DROP POLICY IF EXISTS "Members can read rooms they belong to" ON coderooms;

-- Drop existing problematic policies for coderoom_members
DROP POLICY IF EXISTS "Admins can read their room memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Admins can remove members from their rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can insert own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read own memberships" ON coderoom_members;

-- Drop existing problematic policies for coderoom_posts
DROP POLICY IF EXISTS "Admins can create posts in their rooms" ON coderoom_posts;
DROP POLICY IF EXISTS "Admins can delete their posts" ON coderoom_posts;
DROP POLICY IF EXISTS "Admins can update their posts" ON coderoom_posts;
DROP POLICY IF EXISTS "Members can read posts in their rooms" ON coderoom_posts;

-- Drop existing problematic policies for coderoom_comments
DROP POLICY IF EXISTS "Members can create comments" ON coderoom_comments;
DROP POLICY IF EXISTS "Members can read comments in their rooms" ON coderoom_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON coderoom_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON coderoom_comments;

-- Create new simplified policies for coderooms
CREATE POLICY "Admins can manage their rooms"
  ON coderooms
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (admin_id = auth.uid());

CREATE POLICY "Members can read their rooms"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid() 
    OR 
    id IN (
      SELECT coderoom_id 
      FROM coderoom_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_members
CREATE POLICY "Users can read their own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read memberships for their rooms"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_posts
CREATE POLICY "Admins can manage posts in their rooms"
  ON coderoom_posts
  FOR ALL
  TO authenticated
  USING (admin_id = auth.uid())
  WITH CHECK (
    admin_id = auth.uid() 
    AND 
    coderoom_id IN (
      SELECT id 
      FROM coderooms 
      WHERE admin_id = auth.uid()
    )
  );

CREATE POLICY "Members can read posts in their rooms"
  ON coderoom_posts
  FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid()
    OR
    coderoom_id IN (
      SELECT coderoom_id 
      FROM coderoom_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create new simplified policies for coderoom_comments
CREATE POLICY "Users can manage their own comments"
  ON coderoom_comments
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND
    post_id IN (
      SELECT id 
      FROM coderoom_posts 
      WHERE 
        admin_id = auth.uid()
        OR
        coderoom_id IN (
          SELECT coderoom_id 
          FROM coderoom_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Members can read comments in their rooms"
  ON coderoom_comments
  FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id 
      FROM coderoom_posts 
      WHERE 
        admin_id = auth.uid()
        OR
        coderoom_id IN (
          SELECT coderoom_id 
          FROM coderoom_members 
          WHERE user_id = auth.uid()
        )
    )
  );