-- Run this in your Supabase SQL Editor

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    industry TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ongoing', -- 'ongoing', 'completed'
    chat_history JSONB DEFAULT '[]'::jsonb,
    score INTEGER,
    feedback JSONB, -- { clarity, structure, relevance, correctness, weak_areas, recommendations }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'interview_sessions' AND policyname = 'Users can view their own sessions'
    ) THEN
        CREATE POLICY "Users can view their own sessions"
            ON interview_sessions FOR SELECT
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'interview_sessions' AND policyname = 'Users can insert their own sessions'
    ) THEN
        CREATE POLICY "Users can insert their own sessions"
            ON interview_sessions FOR INSERT
            WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'interview_sessions' AND policyname = 'Users can update their own sessions'
    ) THEN
        CREATE POLICY "Users can update their own sessions"
            ON interview_sessions FOR UPDATE
            USING (auth.uid() = user_id);
    END IF;
END $$;
