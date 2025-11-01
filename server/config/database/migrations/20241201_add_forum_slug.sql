-- Add slug column to forum_topics table
ALTER TABLE forum_topics
ADD COLUMN IF NOT EXISTS slug VARCHAR(500);

-- Create index for slug
CREATE INDEX IF NOT EXISTS forum_topics_slug_idx ON forum_topics(slug);

-- Generate slugs for existing topics based on title
-- This will be done in the application code when topics are updated
