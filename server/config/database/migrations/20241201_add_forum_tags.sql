-- Add tag column to forum_topics table
ALTER TABLE forum_topics
ADD COLUMN IF NOT EXISTS tag VARCHAR(50) DEFAULT 'general'
CHECK (tag IN ('general', 'bug', 'issue', 'uprava'));

-- Create index for tag
CREATE INDEX IF NOT EXISTS forum_topics_tag_idx ON forum_topics(tag);

