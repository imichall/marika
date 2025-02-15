-- První transakce: Přidání 'approve' do ENUM typu
DO $$
BEGIN
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'approve';
END $$;

COMMIT;

-- Druhá transakce: Aktualizace oprávnění a politik
BEGIN;

-- Nastavení admin uživatele
INSERT INTO user_roles (email, role)
VALUES ('iimichal.svoboda@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Odstranění oprávnění 'create' pro form_messages
DELETE FROM permissions
WHERE section = 'form_messages' AND action = 'create';

-- Přidání nového oprávnění 'approve' pro form_messages
INSERT INTO permissions (section, action, description)
VALUES ('form_messages', 'approve', 'Schvalování zpráv z formuláře')
ON CONFLICT (section, action) DO NOTHING;

-- Aktualizace RLS politik pro form_messages
DROP POLICY IF EXISTS "Form messages are approvable by users with permissions" ON form_messages;
DROP POLICY IF EXISTS "Form messages are manageable by users with permissions" ON form_messages;

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
      AND (p.action = 'edit' OR p.action = 'approve')
    )
  );

COMMIT;