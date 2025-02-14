-- Add new values to permission_action_type enum
DO $$
BEGIN
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'complete';
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'cancel';
END $$;

COMMIT;

-- Insert new permissions for orders with Czech descriptions
INSERT INTO permissions (section, action, description)
VALUES
  ('orders', 'complete', 'Označení objednávky jako dokončené'),
  ('orders', 'cancel', 'Zrušení objednávky')
ON CONFLICT (section, action) DO UPDATE
SET description = EXCLUDED.description;

-- Add these permissions to all admin users
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section = 'orders'
  AND p.action IN ('complete', 'cancel')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add these permissions to all editor users
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'editor'
  AND p.section = 'orders'
  AND p.action IN ('complete', 'cancel')
ON CONFLICT (role_id, permission_id) DO NOTHING;