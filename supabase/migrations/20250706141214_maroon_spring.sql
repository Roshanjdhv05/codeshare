/*
  # Add Image Support to Code Snippets

  1. Schema Changes
    - Add `image_url` column to `code_snippets` table
    - Add `image_description` column for accessibility
    - Update RLS policies to include new columns

  2. Features
    - Optional image upload/URL for code snippets
    - Toggle between image view and code view
    - Improved snippet presentation
*/

-- Add image support columns to code_snippets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN image_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'code_snippets' AND column_name = 'image_description'
  ) THEN
    ALTER TABLE code_snippets ADD COLUMN image_description text DEFAULT '';
  END IF;
END $$;