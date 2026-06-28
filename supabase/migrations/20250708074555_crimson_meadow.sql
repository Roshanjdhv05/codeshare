/*
  # Fix infinite recursion in coderoom_members RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "coderoom_members"
    - Occurs when querying coderoom_members table
    - Likely caused by policies that reference the same table they protect

  2. Solution
    - Drop ALL existing policies on coderoom_members
    - Create minimal, non-recursive policies
    - Use direct auth.uid() checks without subqueries where possible
    - Separate admin checks into simpler policies

  3. Security
    - Users can only see their own memberships
    - Users can only join/leave rooms for themselves
    - Admins can see memberships for their rooms (via simple subquery to coderooms)
*/

-- First, disable RLS temporarily to ensure clean slate
ALTER TABLE coderoom_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on coderoom_members to start completely fresh
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'coderoom_members' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON coderoom_members';
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE coderoom_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Policy 1: Users can read their own memberships (no subqueries)
CREATE POLICY "Users can read own memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert their own memberships (no subqueries)
CREATE POLICY "Users can insert own memberships"
  ON coderoom_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can delete their own memberships (no subqueries)
CREATE POLICY "Users can delete own memberships"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 4: Admins can read memberships for their rooms (simple subquery to different table)
CREATE POLICY "Admins can read their room memberships"
  ON coderoom_members
  FOR SELECT
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    )
  );

-- Policy 5: Admins can remove members from their rooms
CREATE POLICY "Admins can remove members from their rooms"
  ON coderoom_members
  FOR DELETE
  TO authenticated
  USING (
    coderoom_id IN (
      SELECT id FROM coderooms WHERE admin_id = auth.uid()
    )
  );