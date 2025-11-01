-- This migration adds foreign key constraints for category and tag
-- Note: We keep VARCHAR columns but validate against the tables

-- Add function to validate category exists
CREATE OR REPLACE FUNCTION validate_forum_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE slug = NEW.category) THEN
    RAISE EXCEPTION 'Invalid category: %', NEW.category;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add function to validate tag exists
CREATE OR REPLACE FUNCTION validate_forum_tag()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM forum_tags WHERE slug = NEW.tag) THEN
    RAISE EXCEPTION 'Invalid tag: %', NEW.tag;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS validate_forum_category_trigger ON forum_topics;
CREATE TRIGGER validate_forum_category_trigger
  BEFORE INSERT OR UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION validate_forum_category();

DROP TRIGGER IF EXISTS validate_forum_tag_trigger ON forum_topics;
CREATE TRIGGER validate_forum_tag_trigger
  BEFORE INSERT OR UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION validate_forum_tag();

