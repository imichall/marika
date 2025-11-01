-- Přidání nové sekce pro fórum do permissions
INSERT INTO permissions (section, action, description)
VALUES
  ('forum', 'view', 'Zobrazení fóra'),
  ('forum', 'create', 'Vytváření témat a odpovědí'),
  ('forum', 'edit', 'Úprava témat a odpovědí'),
  ('forum', 'delete', 'Mazání témat a odpovědí')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání oprávnění pro adminy
INSERT INTO user_permissions (role_id, permission_id)
SELECT
  ur.id,
  p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section = 'forum'
ON CONFLICT (role_id, permission_id) DO NOTHING;

