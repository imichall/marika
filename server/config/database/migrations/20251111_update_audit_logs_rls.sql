-- Aktualizace RLS politiky pro audit_logs, aby admin měl automatický přístup

DROP POLICY IF EXISTS "Audit logs are viewable by users with permissions" ON audit_logs;

CREATE POLICY "Audit logs are viewable by users with permissions"
  ON audit_logs FOR SELECT
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
        AND p.section = 'audit'
        AND p.action = 'view'
    )
  );

