-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create forum_tags table
CREATE TABLE IF NOT EXISTS forum_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO forum_categories (name, slug, color) VALUES
  ('Obecné', 'general', '#3b82f6'),
  ('Oznámení', 'announcement', '#eab308'),
  ('Pomoc', 'help', '#10b981')
ON CONFLICT (slug) DO NOTHING;

-- Insert default tags
INSERT INTO forum_tags (name, slug, color) VALUES
  ('Obecné', 'general', '#6b7280'),
  ('Bug', 'bug', '#ef4444'),
  ('Issue', 'issue', '#f97316'),
  ('Úprava', 'uprava', '#6366f1')
ON CONFLICT (slug) DO NOTHING;

-- Drop old CHECK constraints from forum_topics
ALTER TABLE forum_topics DROP CONSTRAINT IF EXISTS forum_topics_category_check;
ALTER TABLE forum_topics DROP CONSTRAINT IF EXISTS forum_topics_tag_check;

-- Add indexes
CREATE INDEX IF NOT EXISTS forum_categories_slug_idx ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS forum_tags_slug_idx ON forum_tags(slug);

-- Enable Row Level Security
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;

-- Policies for forum_categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON forum_categories;
CREATE POLICY "Categories are viewable by everyone"
  ON forum_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Categories are creatable by admins" ON forum_categories;
CREATE POLICY "Categories are creatable by admins"
  ON forum_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
    )
  );

-- Policies for forum_tags
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON forum_tags;
CREATE POLICY "Tags are viewable by everyone"
  ON forum_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Tags are creatable by admins" ON forum_tags;
CREATE POLICY "Tags are creatable by admins"
  ON forum_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
    )
  );

