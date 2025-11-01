-- Create many-to-many relationship table for topics and tags
CREATE TABLE IF NOT EXISTS forum_topic_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES forum_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(topic_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS forum_topic_tags_topic_idx ON forum_topic_tags(topic_id);
CREATE INDEX IF NOT EXISTS forum_topic_tags_tag_idx ON forum_topic_tags(tag_id);

-- Migrate existing single tag data to new many-to-many table
-- This assumes topics still have a 'tag' column (VARCHAR slug)
-- We'll find the tag by slug and create the relationship
INSERT INTO forum_topic_tags (topic_id, tag_id)
SELECT
  ft.id AS topic_id,
  ftg.id AS tag_id
FROM forum_topics ft
INNER JOIN forum_tags ftg ON ft.tag = ftg.slug
WHERE ft.tag IS NOT NULL
ON CONFLICT (topic_id, tag_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE forum_topic_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forum_topic_tags
DROP POLICY IF EXISTS "Topic tags are viewable by everyone" ON forum_topic_tags;
CREATE POLICY "Topic tags are viewable by everyone"
  ON forum_topic_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Topic tags are creatable by authenticated users" ON forum_topic_tags;
CREATE POLICY "Topic tags are creatable by authenticated users"
  ON forum_topic_tags FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM forum_topics
      WHERE id = topic_id
      AND (
        author_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE email = auth.jwt() ->> 'email'
          AND role = 'admin'
        )
      )
    )
  );

DROP POLICY IF EXISTS "Topic tags are deletable by authenticated users" ON forum_topic_tags;
CREATE POLICY "Topic tags are deletable by authenticated users"
  ON forum_topic_tags FOR DELETE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM forum_topics
      WHERE id = topic_id
      AND (
        author_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM user_roles
          WHERE email = auth.jwt() ->> 'email'
          AND role = 'admin'
        )
      )
    )
  );

-- Note: We keep the old 'tag' column for backward compatibility during migration
-- It can be dropped later if needed

