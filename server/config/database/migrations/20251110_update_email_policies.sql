-- Aktualizace RLS politik pro emaily tak, aby admini měli přístup i bez explicitních user_permissions záznamů.

-- email_logs – SELECT
DROP POLICY IF EXISTS "Email logs are viewable by users with permissions" ON email_logs;
CREATE POLICY "Email logs are viewable by users with permissions"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      LEFT JOIN user_permissions up ON ur.id = up.role_id
      LEFT JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND (
          ur.role = 'admin'
          OR (p.section = 'emails' AND p.action IN ('view', 'manage'))
        )
    )
  );

-- email_recipients – SELECT
DROP POLICY IF EXISTS "Email recipients are viewable by users with permissions" ON email_recipients;
CREATE POLICY "Email recipients are viewable by users with permissions"
  ON email_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      LEFT JOIN user_permissions up ON ur.id = up.role_id
      LEFT JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND (
          ur.role = 'admin'
          OR (p.section = 'emails' AND p.action IN ('view', 'manage'))
        )
    )
  );

-- email_recipients – ALL (správa)
DROP POLICY IF EXISTS "Email recipients are manageable by users with permissions" ON email_recipients;
CREATE POLICY "Email recipients are manageable by users with permissions"
  ON email_recipients FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      LEFT JOIN user_permissions up ON ur.id = up.role_id
      LEFT JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND (
          ur.role = 'admin'
          OR (p.section = 'emails' AND p.action = 'manage')
        )
    )
  );

