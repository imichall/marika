-- Vytvoření tabulky pro oprávnění uživatelů
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Přidání RLS politik
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení - uživatel může číst oprávnění spojená s jeho rolí
CREATE POLICY "Users can read permissions for their roles"
  ON user_permissions
  FOR SELECT
  USING (
    role_id IN (
      SELECT ur.id
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
    )
  );

-- Politika pro vkládání - pouze pro autentizované uživatele s admin rolí
CREATE POLICY "Admins can insert permissions"
  ON user_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Politika pro aktualizaci - pouze pro adminy
CREATE POLICY "Admins can update permissions"
  ON user_permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Trigger pro aktualizaci updated_at
DROP TRIGGER IF EXISTS update_user_permissions_updated_at ON user_permissions;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Přidání indexů pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_user_permissions_role_id ON user_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON user_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_role_permission ON user_permissions(role_id, permission_id);

-- Přidání 'delete' do ENUM typu permission_action_type (pokud ještě neexistuje)
DO $$
BEGIN
    ALTER TYPE permission_action_type ADD VALUE IF NOT EXISTS 'delete';
END $$;

-- Přidání nového oprávnění pro mazání objednávek
INSERT INTO permissions (section, action, description)
VALUES ('orders', 'delete', 'Mazání objednávek')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání oprávnění pro mazání objednávek všem admin uživatelům
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section = 'orders'
  AND p.action = 'delete'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Přidání RLS politiky pro mazání objednávek
DROP POLICY IF EXISTS "Users can delete orders with permission" ON ticket_orders;
CREATE POLICY "Users can delete orders with permission"
  ON ticket_orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'orders'
      AND p.action = 'delete'
    )
  );