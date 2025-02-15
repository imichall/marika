-- Vytvoření tabulky testimonials
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(255),
  source VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření RLS politik pro testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Politika pro zobrazení testimonials
CREATE POLICY "Testimonials are viewable by all when approved"
  ON testimonials FOR SELECT
  USING (status = 'approved');

-- Politika pro správu testimonials
CREATE POLICY "Testimonials are manageable by users with permissions"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'testimonials'
      AND p.action IN ('create', 'edit', 'delete')
    )
  );

-- Přidání nových oprávnění pro testimonials
INSERT INTO permissions (section, action, description)
VALUES
  ('testimonials', 'view', 'Zobrazení referencí'),
  ('testimonials', 'create', 'Vytváření referencí'),
  ('testimonials', 'edit', 'Úprava referencí'),
  ('testimonials', 'delete', 'Mazání referencí');

-- Trigger pro aktualizaci updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();