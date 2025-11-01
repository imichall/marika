-- Add session_id column to forum_topic_views table
ALTER TABLE forum_topic_views
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Create index for session_id and topic_id combination for faster lookups
CREATE INDEX IF NOT EXISTS forum_topic_views_session_topic_idx
ON forum_topic_views(session_id, topic_id);

-- Create unique constraint to prevent duplicate views per session
CREATE UNIQUE INDEX IF NOT EXISTS forum_topic_views_session_topic_email_unique
ON forum_topic_views(session_id, topic_id, viewed_by_email);

