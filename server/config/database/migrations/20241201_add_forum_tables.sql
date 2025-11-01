-- Create forum topics table
CREATE TABLE IF NOT EXISTS forum_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'announcement', 'help')),
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'archived')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_email VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_best_answer BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create forum_topic_likes table for tracking user likes on topics
CREATE TABLE IF NOT EXISTS forum_topic_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, user_email)
);

-- Create forum_reply_likes table for tracking user likes on replies
CREATE TABLE IF NOT EXISTS forum_reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reply_id, user_email)
);

-- Create indexes for better performance
CREATE INDEX forum_topics_category_idx ON forum_topics(category);
CREATE INDEX forum_topics_status_idx ON forum_topics(status);
CREATE INDEX forum_topics_is_pinned_idx ON forum_topics(is_pinned);
CREATE INDEX forum_topics_last_activity_idx ON forum_topics(last_activity_at DESC);
CREATE INDEX forum_replies_topic_idx ON forum_replies(topic_id);
CREATE INDEX forum_replies_created_idx ON forum_replies(created_at DESC);
CREATE INDEX forum_topic_likes_topic_idx ON forum_topic_likes(topic_id);
CREATE INDEX forum_reply_likes_reply_idx ON forum_reply_likes(reply_id);

-- Enable Row Level Security
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topic_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topics
DROP POLICY IF EXISTS "Forum topics are viewable by authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Forum topics are creatable by authenticated users" ON forum_topics;
DROP POLICY IF EXISTS "Forum topics are editable by author or admin" ON forum_topics;
DROP POLICY IF EXISTS "Forum topics are deletable by admin" ON forum_topics;

CREATE POLICY "Forum topics are viewable by authenticated users"
  ON forum_topics FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum topics are creatable by authenticated users"
  ON forum_topics FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = author_email
  );

CREATE POLICY "Forum topics are editable by author or admin"
  ON forum_topics FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      auth.jwt() ->> 'email' = author_email OR
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
      )
    )
  );

CREATE POLICY "Forum topics are deletable by admin"
  ON forum_topics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Policies for forum_replies
DROP POLICY IF EXISTS "Forum replies are viewable by authenticated users" ON forum_replies;
DROP POLICY IF EXISTS "Forum replies are creatable by authenticated users" ON forum_replies;
DROP POLICY IF EXISTS "Forum replies are editable by author or admin" ON forum_replies;
DROP POLICY IF EXISTS "Forum replies are deletable by author or admin" ON forum_replies;

CREATE POLICY "Forum replies are viewable by authenticated users"
  ON forum_replies FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum replies are creatable by authenticated users"
  ON forum_replies FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = author_email
  );

CREATE POLICY "Forum replies are editable by author or admin"
  ON forum_replies FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    (
      auth.jwt() ->> 'email' = author_email OR
      EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
      )
    )
  );

CREATE POLICY "Forum replies are deletable by author or admin"
  ON forum_replies FOR DELETE
  USING (
    auth.jwt() ->> 'email' = author_email OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Policies for forum_topic_likes
DROP POLICY IF EXISTS "Forum topic likes are viewable by authenticated users" ON forum_topic_likes;
DROP POLICY IF EXISTS "Forum topic likes are creatable by authenticated users" ON forum_topic_likes;
DROP POLICY IF EXISTS "Forum topic likes are deletable by user" ON forum_topic_likes;

CREATE POLICY "Forum topic likes are viewable by authenticated users"
  ON forum_topic_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum topic likes are creatable by authenticated users"
  ON forum_topic_likes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = user_email
  );

CREATE POLICY "Forum topic likes are deletable by user"
  ON forum_topic_likes FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Policies for forum_reply_likes
DROP POLICY IF EXISTS "Forum reply likes are viewable by authenticated users" ON forum_reply_likes;
DROP POLICY IF EXISTS "Forum reply likes are creatable by authenticated users" ON forum_reply_likes;
DROP POLICY IF EXISTS "Forum reply likes are deletable by user" ON forum_reply_likes;

CREATE POLICY "Forum reply likes are viewable by authenticated users"
  ON forum_reply_likes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Forum reply likes are creatable by authenticated users"
  ON forum_reply_likes FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = user_email
  );

CREATE POLICY "Forum reply likes are deletable by user"
  ON forum_reply_likes FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Create function to update reply_count and last_activity_at when reply is added
CREATE OR REPLACE FUNCTION update_topic_on_reply()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET
    reply_count = reply_count + 1,
    last_activity_at = NEW.created_at
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update reply_count when reply is deleted
CREATE OR REPLACE FUNCTION update_topic_on_reply_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_topics
  SET
    reply_count = reply_count - 1
  WHERE id = OLD.topic_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for replies
DROP TRIGGER IF EXISTS trigger_update_topic_on_reply ON forum_replies;
CREATE TRIGGER trigger_update_topic_on_reply
  AFTER INSERT ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_on_reply();

-- Create trigger for reply deletion
DROP TRIGGER IF EXISTS trigger_update_topic_on_reply_delete ON forum_replies;
CREATE TRIGGER trigger_update_topic_on_reply_delete
  AFTER DELETE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_topic_on_reply_delete();

-- Create function to increment topic views
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at columns
CREATE OR REPLACE FUNCTION update_forum_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS trigger_update_forum_topics_updated_at ON forum_topics;
CREATE TRIGGER trigger_update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_updated_at();

DROP TRIGGER IF EXISTS trigger_update_forum_replies_updated_at ON forum_replies;
CREATE TRIGGER trigger_update_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_forum_updated_at();

