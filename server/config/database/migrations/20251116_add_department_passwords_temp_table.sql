-- Vytvoření dočasné tabulky pro ukládání nehasheovaných hesel oddílů
CREATE TABLE IF NOT EXISTS department_passwords_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES member_departments(id) ON DELETE CASCADE,
  password TEXT NOT NULL,
  created_by_email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(department_id)
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_department_passwords_temp_department_id ON department_passwords_temp(department_id);
CREATE INDEX IF NOT EXISTS idx_department_passwords_temp_expires_at ON department_passwords_temp(expires_at);

-- RLS politika - pouze oprávnění uživatelé mohou číst hesla
ALTER TABLE department_passwords_temp ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení - pouze uživatelé s oprávněním password_view nebo ti, kteří heslo vytvořili
CREATE POLICY "Users can read passwords they created or have permission"
  ON department_passwords_temp
  FOR SELECT
  USING (
    created_by_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'member_departments'
      AND p.action = 'password_view'
    )
  );

-- Politika pro vkládání - pouze oprávnění uživatelé
CREATE POLICY "Users can insert passwords if they can edit departments"
  ON department_passwords_temp
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'member_departments'
      AND (p.action = 'create' OR p.action = 'edit')
    )
  );

-- Politika pro mazání - pouze uživatelé, kteří heslo vytvořili, nebo admini
CREATE POLICY "Users can delete passwords they created or admins"
  ON department_passwords_temp
  FOR DELETE
  USING (
    created_by_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
    )
  );

-- Funkce pro automatické mazání expirovaných hesel
CREATE OR REPLACE FUNCTION cleanup_expired_passwords()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM department_passwords_temp
  WHERE expires_at < NOW();
END;
$$;

-- Trigger nebo scheduled job pro automatické mazání (můžeme spustit manuálně nebo přes cron)
-- Pro teď to necháme na manuálním spuštění nebo můžeme přidat trigger

COMMENT ON TABLE department_passwords_temp IS 'Dočasná tabulka pro ukládání nehasheovaných hesel oddílů s expirací 24 hodin';

