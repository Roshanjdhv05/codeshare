/*
  # Remove CodeRoom Feature

  1. Drop Tables
    - Drop all coderoom-related tables and their dependencies
    - Remove triggers and functions related to coderooms

  2. Clean Up
    - Remove all policies, triggers, and functions
    - Drop tables in correct dependency order
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS add_admin_as_member_trigger ON coderooms;

-- Drop functions
DROP FUNCTION IF EXISTS add_admin_as_member();
DROP FUNCTION IF EXISTS generate_room_code();

-- Drop tables in dependency order (child tables first)
DROP TABLE IF EXISTS coderoom_comments CASCADE;
DROP TABLE IF EXISTS coderoom_posts CASCADE;
DROP TABLE IF EXISTS coderoom_members CASCADE;
DROP TABLE IF EXISTS coderooms CASCADE;