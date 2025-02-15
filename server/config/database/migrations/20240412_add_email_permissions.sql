-- Přidání nové sekce pro emaily do permissions
INSERT INTO permissions (section, action, description)
VALUES
  ('emails', 'view', 'Zobrazení historie emailů'),
  ('emails', 'manage', 'Správa emailů a nastavení')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání oprávnění pro adminy
INSERT INTO user_permissions (role_id, permission_id)
SELECT
  ur.id,
  p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section = 'emails'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Upravení RLS politiky pro email_logs
DROP POLICY IF EXISTS "Email logs are viewable by users with permissions" ON email_logs;
CREATE POLICY "Email logs are viewable by users with permissions"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'emails'
      AND p.action IN ('view', 'manage')
    )
  );

-- Funkce pro získání oprávnění uživatele
CREATE OR REPLACE FUNCTION get_user_permissions(p_email text)
RETURNS TABLE (
  section varchar(50),
  action permission_action_type
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Pro adminy vrátíme všechna oprávnění
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE email = p_email
    AND role = 'admin'
  ) THEN
    RETURN QUERY
      SELECT p.section, p.action
      FROM permissions p;
  ELSE
    -- Pro ostatní role vrátíme jejich specifická oprávnění
    RETURN QUERY
      SELECT DISTINCT p.section, p.action
      FROM permissions p
      JOIN user_permissions up ON p.id = up.permission_id
      JOIN user_roles ur ON ur.id = up.role_id
      WHERE ur.email = p_email;
  END IF;
END;
$$;