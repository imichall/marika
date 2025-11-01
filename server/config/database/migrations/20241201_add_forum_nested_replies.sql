-- Add parent_reply_id column to forum_replies for nested replies
ALTER TABLE forum_replies
ADD COLUMN IF NOT EXISTS parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE;

-- Create index for parent_reply_id
CREATE INDEX IF NOT EXISTS forum_replies_parent_reply_idx ON forum_replies(parent_reply_id);
