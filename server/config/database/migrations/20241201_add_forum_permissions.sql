-- Přidání nové sekce pro fórum do permissions
DELETE FROM user_permissions
USING permissions p
WHERE user_permissions.permission_id = p.id
  AND p.section = 'forum';

DELETE FROM permissions
WHERE section = 'forum';

INSERT INTO permissions (section, action, description)
VALUES
  ('forum_view', 'view', 'Zobrazení fóra v členské sekci'),
  ('forum_create', 'create', 'Vytváření témat a odpovědí'),
  ('forum_delete', 'delete', 'Mazání témat a odpovědí'),
  ('forum_categories', 'manage', 'Správa kategorií fóra'),
  ('forum_tags', 'manage', 'Správa tagů fóra')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání oprávnění pro adminy
INSERT INTO user_permissions (role_id, permission_id)
SELECT
  ur.id,
  p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section IN ('forum_view', 'forum_create', 'forum_delete', 'forum_categories', 'forum_tags')
ON CONFLICT (role_id, permission_id) DO NOTHING;

