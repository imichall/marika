-- Add scope column to separate admin and members forum topics
ALTER TABLE forum_topics
  ADD COLUMN IF NOT EXISTS scope VARCHAR(20)
  CHECK (scope IN ('admin', 'members'))
  DEFAULT 'admin';

-- Backfill existing topics to default scope
UPDATE forum_topics
SET scope = 'admin'
WHERE scope IS NULL;

-- Index for faster filtering by scope
CREATE INDEX IF NOT EXISTS forum_topics_scope_idx
  ON forum_topics(scope);

