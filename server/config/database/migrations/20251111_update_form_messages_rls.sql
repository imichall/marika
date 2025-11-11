-- Aktualizace RLS politik pro form_messages, aby admin měl automatický přístup

-- Krok 1: Přidáme 'approve' do ENUM typu (pokud ještě neexistuje)
-- Toto musí být samostatná transakce
DO $$
BEGIN
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'approve';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Krok 2: COMMIT předchozí změny před použitím nové enum hodnoty
-- (V Supabase SQL Editoru se transakce automaticky commituje)

-- Krok 3: Přidání oprávnění 'approve' pro form_messages
INSERT INTO permissions (section, action, description)
VALUES ('form_messages', 'approve', 'Schvalování zpráv z formuláře')
ON CONFLICT (section, action) DO NOTHING;

-- Krok 4: Aktualizace RLS politik
DROP POLICY IF EXISTS "Form messages are viewable by users with permissions" ON form_messages;
DROP POLICY IF EXISTS "Form messages are manageable by users with permissions" ON form_messages;
DROP POLICY IF EXISTS "Form messages are deletable by users with permissions" ON form_messages;

-- Politika pro zobrazení form_messages
CREATE POLICY "Form messages are viewable by users with permissions"
  ON form_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
    OR
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

-- Politika pro správu form_messages (UPDATE)
CREATE POLICY "Form messages are manageable by users with permissions"
  ON form_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'form_messages'
        AND (p.action = 'edit' OR p.action = 'approve')
    )
  );

-- Politika pro mazání form_messages
CREATE POLICY "Form messages are deletable by users with permissions"
  ON form_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
    OR
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

