-- Nejprve odstraníme existující politiky
DROP POLICY IF EXISTS "Contacts are viewable by everyone" ON contacts;
DROP POLICY IF EXISTS "Contacts can be modified only by admin" ON contacts;
DROP POLICY IF EXISTS "Contacts are manageable by users with permissions" ON contacts;

-- Politika pro zobrazení kontaktů (může kdokoliv)
CREATE POLICY "Contacts are viewable by everyone"
  ON contacts FOR SELECT
  USING (true);

-- Politika pro správu kontaktů (pouze uživatelé s oprávněním)
CREATE POLICY "Contacts are manageable by users with permissions"
  ON contacts FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'contacts'
      AND p.action IN ('create', 'edit', 'delete')
    )
  );