-- Create forum_topic_edit_history table for tracking topic edits
CREATE TABLE IF NOT EXISTS forum_topic_edit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  edited_by_email VARCHAR(255) NOT NULL,
  edited_by_name VARCHAR(255) NOT NULL,
  old_title VARCHAR(500),
  new_title VARCHAR(500),
  old_content TEXT,
  new_content TEXT,
  old_category VARCHAR(50),
  new_category VARCHAR(50),
  old_tag VARCHAR(50),
  new_tag VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create forum_topic_views table for tracking when topics were viewed
CREATE TABLE IF NOT EXISTS forum_topic_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  viewed_by_email VARCHAR(255) NOT NULL,
  viewed_by_name VARCHAR(255) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX forum_topic_edit_history_topic_idx ON forum_topic_edit_history(topic_id);
CREATE INDEX forum_topic_edit_history_created_idx ON forum_topic_edit_history(created_at DESC);
CREATE INDEX forum_topic_views_topic_idx ON forum_topic_views(topic_id);
CREATE INDEX forum_topic_views_viewed_idx ON forum_topic_views(viewed_at DESC);
CREATE INDEX forum_topic_views_user_idx ON forum_topic_views(viewed_by_email);

-- Enable Row Level Security
ALTER TABLE forum_topic_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topic_views ENABLE ROW LEVEL SECURITY;

-- Policies for forum_topic_edit_history
DROP POLICY IF EXISTS "Forum edit history is viewable by authenticated users" ON forum_topic_edit_history;
CREATE POLICY "Forum edit history is viewable by authenticated users"
  ON forum_topic_edit_history FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Forum edit history is creatable by authenticated users" ON forum_topic_edit_history;
CREATE POLICY "Forum edit history is creatable by authenticated users"
  ON forum_topic_edit_history FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = edited_by_email
  );

-- Policies for forum_topic_views
DROP POLICY IF EXISTS "Forum views are viewable by authenticated users" ON forum_topic_views;
CREATE POLICY "Forum views are viewable by authenticated users"
  ON forum_topic_views FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Forum views are creatable by authenticated users" ON forum_topic_views;
CREATE POLICY "Forum views are creatable by authenticated users"
  ON forum_topic_views FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.jwt() ->> 'email' = viewed_by_email
  );

-- Create trigger function to log edits
CREATE OR REPLACE FUNCTION log_forum_topic_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log only if there were actual changes
  IF OLD.title IS DISTINCT FROM NEW.title OR
     OLD.content IS DISTINCT FROM NEW.content OR
     OLD.category IS DISTINCT FROM NEW.category OR
     (OLD.tag IS DISTINCT FROM NEW.tag OR (OLD.tag IS NULL AND NEW.tag IS NOT NULL)) THEN

    INSERT INTO forum_topic_edit_history (
      topic_id,
      edited_by_email,
      edited_by_name,
      old_title,
      new_title,
      old_content,
      new_content,
      old_category,
      new_category,
      old_tag,
      new_tag
    )
    VALUES (
      NEW.id,
      NEW.author_email, -- Current author
      NEW.author_name,
      CASE WHEN OLD.title IS DISTINCT FROM NEW.title THEN OLD.title ELSE NULL END,
      CASE WHEN OLD.title IS DISTINCT FROM NEW.title THEN NEW.title ELSE NULL END,
      CASE WHEN OLD.content IS DISTINCT FROM NEW.content THEN OLD.content ELSE NULL END,
      CASE WHEN OLD.content IS DISTINCT FROM NEW.content THEN NEW.content ELSE NULL END,
      CASE WHEN OLD.category IS DISTINCT FROM NEW.category THEN OLD.category ELSE NULL END,
      CASE WHEN OLD.category IS DISTINCT FROM NEW.category THEN NEW.category ELSE NULL END,
      CASE WHEN (OLD.tag IS DISTINCT FROM NEW.tag OR (OLD.tag IS NULL AND NEW.tag IS NOT NULL)) THEN COALESCE(OLD.tag, 'general') ELSE NULL END,
      CASE WHEN (OLD.tag IS DISTINCT FROM NEW.tag OR (OLD.tag IS NULL AND NEW.tag IS NOT NULL)) THEN NEW.tag ELSE NULL END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging edits
DROP TRIGGER IF EXISTS trigger_log_forum_topic_edit ON forum_topics;
CREATE TRIGGER trigger_log_forum_topic_edit
  AFTER UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION log_forum_topic_edit();

