-- První transakce: Přidání 'password_view' do ENUM typu permission_action_type
DO $$
BEGIN
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'password_view';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMIT;

-- Druhá transakce: Přidání oprávnění pro zobrazení hesla oddílů
BEGIN;

INSERT INTO permissions (section, action, description)
VALUES ('member_departments', 'password_view', 'Zobrazení hesla oddílů členské sekce')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání oprávnění pro zobrazení hesla oddílů všem admin uživatelům
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section = 'member_departments'
  AND p.action = 'password_view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;

