/*
  # Real-Time Chat System

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `status` (text: 'pending' | 'accepted' | 'rejected')
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text: 'message' | 'friend_request')
      - `reference_id` (uuid)
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
    - Only involved users can access their data

  3. Indexes
    - Optimize for chat queries
    - Friend lookup performance
    - Notification retrieval
*/

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('message', 'friend_request')),
  reference_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view friendships they're involved in"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update friendships they're involved in"
  ON friendships
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_friendships_sender ON friendships(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_receiver ON friendships(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Function to get chat participants
CREATE OR REPLACE FUNCTION get_chat_participants(user_uuid uuid)
RETURNS TABLE (
  friend_id uuid,
  username text,
  full_name text,
  avatar_url text,
  last_message_content text,
  last_message_time timestamptz,
  unread_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    CASE 
      WHEN f.sender_id = user_uuid THEN f.receiver_id
      ELSE f.sender_id
    END as friend_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(latest_msg.content, '') as last_message_content,
    latest_msg.created_at as last_message_time,
    COALESCE(unread.count, 0) as unread_count
  FROM friendships f
  JOIN profiles p ON (
    CASE 
      WHEN f.sender_id = user_uuid THEN p.id = f.receiver_id
      ELSE p.id = f.sender_id
    END
  )
  LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM messages m
    WHERE (
      (m.sender_id = user_uuid AND m.receiver_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END) OR
      (m.receiver_id = user_uuid AND m.sender_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END)
    )
    ORDER BY created_at DESC
    LIMIT 1
  ) latest_msg ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM notifications n
    WHERE n.user_id = user_uuid 
      AND n.type = 'message'
      AND n.is_read = false
      AND EXISTS (
        SELECT 1 FROM messages msg 
        WHERE msg.id::text = n.reference_id::text 
          AND msg.sender_id = CASE WHEN f.sender_id = user_uuid THEN f.receiver_id ELSE f.sender_id END
      )
  ) unread ON true
  WHERE f.status = 'accepted'
    AND (f.sender_id = user_uuid OR f.receiver_id = user_uuid)
  ORDER BY COALESCE(latest_msg.created_at, f.created_at) DESC;
END;
$$;