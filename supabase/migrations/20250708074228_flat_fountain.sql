/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Policy Updates
    - Drop existing problematic policies on coderoom_members table
    - Create new policies that avoid recursive references
    - Allow users to read their own memberships
    - Allow coderoom admins to read all members in their rooms

  2. Security
    - Maintain RLS protection
    - Ensure proper access control without recursion
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Room admins can view memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Room admins can remove members" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;

-- Create new SELECT policy that avoids recursion
CREATE POLICY "Users can read own memberships and admins can read their room members"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    ))
  );

-- Create INSERT policy for joining rooms
CREATE POLICY "Users can join rooms"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create DELETE policy for leaving rooms and admin removal
CREATE POLICY "Users can leave rooms and admins can remove members"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    ))
  );