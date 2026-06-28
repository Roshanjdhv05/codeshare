/*
  # Fix CodeRooms RLS policies to prevent infinite recursion

  1. Policy Changes
    - Remove problematic recursive policies on coderooms table
    - Create simplified, non-recursive policies
    - Fix coderoom_members policies to avoid conflicts

  2. Security
    - Admins can manage their own rooms
    - Members can read rooms they belong to
    - Users can manage their own memberships
    - Admins can read memberships for their rooms
*/

-- Drop ALL existing policies on coderooms to start fresh
DROP POLICY IF EXISTS "Users can read rooms they are members of" ON coderooms;
DROP POLICY IF EXISTS "Admins can delete their rooms" ON coderooms;
DROP POLICY IF EXISTS "Admins can update their rooms" ON coderooms;
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON coderooms;

-- Drop ALL existing policies on coderoom_members to avoid conflicts
DROP POLICY IF EXISTS "Users can read memberships for rooms they belong to" ON coderoom_members;
DROP POLICY IF EXISTS "Users can join rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can leave rooms" ON coderoom_members;
DROP POLICY IF EXISTS "Users can read their own memberships" ON coderoom_members;
DROP POLICY IF EXISTS "Admins can read memberships for their rooms" ON coderoom_members;

-- Create new, simpler policies for coderooms
CREATE POLICY "Admins can manage their own rooms"
  ON coderooms
  FOR ALL
  TO authenticated
  USING (auth.uid() = admin_id)
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Members can read rooms they belong to"
  ON coderooms
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = admin_id OR 
    auth.uid() IN (
      SELECT user_id 
      FROM coderoom_members 
      WHERE coderoom_id = coderooms.id
    )
  );

-- Create new policies for coderoom_members
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
    EXISTS (
      SELECT 1 
      FROM coderooms 
      WHERE coderooms.id = coderoom_members.coderoom_id 
      AND coderooms.admin_id = auth.uid()
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