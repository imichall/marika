-- Add dislike tracking to forum topics
CREATE TABLE IF NOT EXISTS forum_topic_dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, user_email)
);

-- Add dislike tracking to forum replies
CREATE TABLE IF NOT EXISTS forum_reply_dislikes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_email)
);

-- Create indexes
CREATE INDEX forum_topic_dislikes_topic_idx ON forum_topic_dislikes(topic_id);
CREATE INDEX forum_reply_dislikes_reply_idx ON forum_reply_dislikes(reply_id);

-- Enable Row Level Security
ALTER TABLE forum_topic_dislikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reply_dislikes ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topic_dislikes
DROP POLICY IF EXISTS "Forum topic dislikes are viewable by authenticated users" ON forum_topic_dislikes;
DROP POLICY IF EXISTS "Forum topic dislikes are creatable by authenticated users" ON forum_topic_dislikes;

CREATE POLICY "Forum topic dislikes are viewable by authenticated users"
  ON forum_topic_dislikes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum topic dislikes are creatable by authenticated users"
  ON forum_topic_dislikes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = user_email
  );

CREATE POLICY "Forum topic dislikes are deletable by user"
  ON forum_topic_dislikes FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Policies for forum_reply_dislikes
DROP POLICY IF EXISTS "Forum reply dislikes are viewable by authenticated users" ON forum_reply_dislikes;
DROP POLICY IF EXISTS "Forum reply dislikes are creatable by authenticated users" ON forum_reply_dislikes;

CREATE POLICY "Forum reply dislikes are viewable by authenticated users"
  ON forum_reply_dislikes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum reply dislikes are creatable by authenticated users"
  ON forum_reply_dislikes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = user_email
  );

CREATE POLICY "Forum reply dislikes are deletable by user"
  ON forum_reply_dislikes FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);
