-- Vytvoření tabulky form_messages pro zprávy z formuláře
CREATE TABLE IF NOT EXISTS form_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_testimonial BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření RLS politik pro form_messages
DROP POLICY IF EXISTS "Anyone can create form messages" ON form_messages;
DROP POLICY IF EXISTS "Form messages are viewable by users with permissions" ON form_messages;
DROP POLICY IF EXISTS "Form messages are manageable by users with permissions" ON form_messages;
DROP POLICY IF EXISTS "Form messages are deletable by users with permissions" ON form_messages;

ALTER TABLE form_messages ENABLE ROW LEVEL SECURITY;

-- Politika pro vytváření zpráv (povoleno všem)
CREATE POLICY "Anyone can create form messages"
  ON form_messages FOR INSERT
  WITH CHECK (true);

-- Politika pro zobrazení form_messages (pouze pro oprávněné uživatele)
CREATE POLICY "Form messages are viewable by users with permissions"
  ON form_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'form_messages'
      AND p.action = 'view'
    )
  );

-- Politika pro správu form_messages (pouze pro oprávněné uživatele)
CREATE POLICY "Form messages are manageable by users with permissions"
  ON form_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'form_messages'
      AND p.action = 'edit'
    )
  );

-- Politika pro mazání form_messages (pouze pro oprávněné uživatele)
CREATE POLICY "Form messages are deletable by users with permissions"
  ON form_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'form_messages'
      AND p.action = 'delete'
    )
  );

-- Přidání nových oprávnění pro form_messages
INSERT INTO permissions (section, action, description)
VALUES
  ('form_messages', 'view', 'Zobrazení zpráv z formuláře'),
  ('form_messages', 'edit', 'Úprava zpráv z formuláře'),
  ('form_messages', 'delete', 'Mazání zpráv z formuláře')
ON CONFLICT (section, action) DO NOTHING;

-- Trigger pro aktualizaci updated_at
DROP TRIGGER IF EXISTS set_form_messages_updated_at ON form_messages;
CREATE TRIGGER set_form_messages_updated_at
  BEFORE UPDATE ON form_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Přidání indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_form_messages_status ON form_messages(status);
CREATE INDEX IF NOT EXISTS idx_form_messages_is_testimonial ON form_messages(is_testimonial);