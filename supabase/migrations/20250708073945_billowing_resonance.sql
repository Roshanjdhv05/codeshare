/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Policy Updates
    - Drop existing problematic policies on coderoom_members table
    - Create new, simplified policies that avoid circular references
    - Ensure policies are efficient and don't cause infinite recursion

  2. Security
    - Maintain proper access control for coderoom members
    - Allow users to read their own memberships
    - Allow admins to manage memberships in their rooms
    - Prevent unauthorized access to membership data
*/

-- Drop existing policies that are causing infinite recursion
DROP POLICY IF EXISTS "Admins can read memberships for their rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON coderoom_members;

-- Create new, simplified policies that avoid circular references

-- Allow users to read their own membership records
CREATE POLICY "Users can view their own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own membership records (for joining rooms)
CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own membership records (for leaving rooms)
CREATE POLICY "Users can leave rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow room admins to view all memberships for their rooms
-- This policy avoids recursion by directly checking the coderooms table
CREATE POLICY "Room admins can view memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
    )
  );

-- Allow room admins to remove members from their rooms
CREATE POLICY "Room admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
    )
  );