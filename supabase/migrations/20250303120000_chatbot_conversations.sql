/*
  # Create chatbot_conversations and chatbot_messages tables

  1. New Tables
    - `chatbot_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `chatbot_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key)
      - `role` (text, not null) - 'user' or 'assistant'
      - `content` (text, not null)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public access to create conversations
    - Add policies for users to access their own conversations
*/

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chatbot_messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chatbot_conversations
CREATE POLICY "Allow public to create conversations"
  ON chatbot_conversations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read their own conversations"
  ON chatbot_conversations
  FOR SELECT
  TO public
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Allow users to update their own conversations"
  ON chatbot_conversations
  FOR UPDATE
  TO public
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Policies for chatbot_messages
CREATE POLICY "Allow public to insert messages"
  ON chatbot_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow users to read messages from their conversations"
  ON chatbot_messages
  FOR SELECT
  TO public
  USING (
    conversation_id IN (
      SELECT id FROM chatbot_conversations 
      WHERE user_id IS NULL OR user_id = auth.uid()
    )
  );