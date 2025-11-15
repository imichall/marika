-- Migrace: Přidání oddílů členské sekce a jejich uživatelů
-- Vytvoření tabulek pro správu oddílů, jejich hesel a uživatelů

-- POVOLENÍ PGCRYPTO EXTENSION (pro bcrypt hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ODSTRANĚNÍ EXISTUJÍCÍCH OBJEKTŮ (IDEMPOTENTNÍ)
DO $$
BEGIN
  EXECUTE '
    DROP POLICY IF EXISTS "Member departments view" ON member_departments;
    DROP POLICY IF EXISTS "Member departments manage" ON member_departments;
    DROP POLICY IF EXISTS "Member users view" ON member_users;
    DROP POLICY IF EXISTS "Member users manage" ON member_users;
    DROP POLICY IF EXISTS "Member login logs view" ON member_login_logs;
    DROP TABLE IF EXISTS member_login_logs CASCADE;
    DROP TABLE IF EXISTS member_users CASCADE;
    DROP TABLE IF EXISTS member_departments CASCADE;
  ';
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- TABULKA PRO ODDÍLY (HLASY)
CREATE TABLE member_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TABULKA PRO UŽIVATELE ČLENSKÉ SEKCE
CREATE TABLE member_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES member_departments(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TABULKA PRO SLEDOVÁNÍ PŘIHLÁŠENÍ
CREATE TABLE member_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID NOT NULL REFERENCES member_departments(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES member_users(id) ON DELETE SET NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXY PRO RYCHLÉ VYHLEDÁVÁNÍ
CREATE INDEX idx_member_users_department_id ON member_users(department_id);
CREATE INDEX idx_member_users_full_name ON member_users USING gin (to_tsvector('simple', coalesce(full_name, '')));
CREATE INDEX idx_member_users_email ON member_users(email);
CREATE INDEX idx_member_login_logs_department_id ON member_login_logs(department_id);
CREATE INDEX idx_member_login_logs_member_user_id ON member_login_logs(member_user_id);
CREATE INDEX idx_member_login_logs_login_at ON member_login_logs(login_at DESC);

-- TRIGGERY PRO AKTUALIZACI updated_at
DROP TRIGGER IF EXISTS set_member_departments_updated_at ON member_departments;
CREATE TRIGGER set_member_departments_updated_at
  BEFORE UPDATE ON member_departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_member_users_updated_at ON member_users;
CREATE TRIGGER set_member_users_updated_at
  BEFORE UPDATE ON member_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- POVOLENÍ RLS
ALTER TABLE member_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_login_logs ENABLE ROW LEVEL SECURITY;

-- POLITIKY PRO ODDÍLY (pouze admini a editori)
CREATE POLICY "Member departments view"
  ON member_departments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Member departments manage"
  ON member_departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

-- POLITIKY PRO UŽIVATELE ČLENSKÉ SEKCE
CREATE POLICY "Member users view"
  ON member_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Member users manage"
  ON member_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

-- POLITIKY PRO LOGY PŘIHLÁŠENÍ (pouze admini)
CREATE POLICY "Member login logs view"
  ON member_login_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

-- FUNKCE PRO OVĚŘENÍ HESLA ODDÍLU
CREATE OR REPLACE FUNCTION verify_department_password(
  p_department_name VARCHAR(50),
  p_password TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  department_id UUID,
  department_name VARCHAR(50)
)
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
DECLARE
  v_department_id UUID;
  v_password_hash TEXT;
  v_dept_name VARCHAR(50);
BEGIN
  -- Získání hashe hesla pro oddíl
  SELECT id, password_hash, name INTO v_department_id, v_password_hash, v_dept_name
  FROM public.member_departments
  WHERE name = p_department_name
    AND is_active = TRUE;

  -- Pokud oddíl neexistuje
  IF v_department_id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR(50);
    RETURN;
  END IF;

  -- Ověření hesla pomocí bcrypt
  IF extensions.crypt(p_password, v_password_hash) = v_password_hash THEN
    RETURN QUERY SELECT TRUE, v_department_id, v_dept_name;
  ELSE
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::VARCHAR(50);
  END IF;
END;
$$;

-- FUNKCE PRO VYTVOŘENÍ HASHE HESLA
CREATE OR REPLACE FUNCTION hash_department_password(p_password TEXT)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public, extensions
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN extensions.crypt(p_password, extensions.gen_salt('bf'));
END;
$$;

-- VLOŽENÍ VÝCHOZÍCH ODDÍLŮ
INSERT INTO member_departments (name, display_name, password_hash, description)
VALUES
  ('alt', 'Alt', hash_department_password('alt2024'), 'Oddíl alt'),
  ('bas', 'Bas', hash_department_password('bas2024'), 'Oddíl bas'),
  ('hoste', 'Hosté', hash_department_password('hoste2024'), 'Hosté sboru'),
  ('hudebnici', 'Hudebníci', hash_department_password('hudebnici2024'), 'Hudebníci sboru'),
  ('podpora', 'Podpora', hash_department_password('podpora2024'), 'Podpůrný tým'),
  ('sopran', 'Soprán', hash_department_password('sopran2024'), 'Oddíl soprán'),
  ('vedeni', 'Vedení', hash_department_password('vedeni2024'), 'Vedení sboru')
ON CONFLICT (name) DO NOTHING;

-- PŘIDÁNÍ NOVÝCH OPRÁVNĚNÍ
INSERT INTO permissions (section, action, description)
VALUES
  ('member_departments', 'view', 'Zobrazení oddílů členské sekce'),
  ('member_departments', 'create', 'Vytváření oddílů'),
  ('member_departments', 'edit', 'Úprava oddílů'),
  ('member_departments', 'delete', 'Mazání oddílů'),
  ('member_management', 'view', 'Zobrazení členů oddílů'),
  ('member_management', 'create', 'Přidávání členů do oddílů'),
  ('member_management', 'edit', 'Úprava členů oddílů'),
  ('member_management', 'delete', 'Mazání členů z oddílů')
ON CONFLICT (section, action) DO NOTHING;

-- PŘIŘAZENÍ OPRÁVNĚNÍ ADMINŮM
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section IN ('member_departments', 'member_management')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PŘIŘAZENÍ OPRÁVNĚNÍ EDITORŮM (všechna práva kromě mazání oddílů)
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
JOIN permissions p ON p.section IN ('member_departments', 'member_management')
WHERE ur.role = 'editor'
  AND (
    (p.section = 'member_departments' AND p.action IN ('view', 'edit'))
    OR (p.section = 'member_management' AND p.action IN ('view', 'create', 'edit', 'delete'))
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMENT ON TABLE member_departments IS 'Oddíly členské sekce (hlasy) se společnými hesly';
COMMENT ON TABLE member_users IS 'Uživatelé přiřazení k oddílům členské sekce';
COMMENT ON TABLE member_login_logs IS 'Záznamy o přihlášení členů podle oddílu';
COMMENT ON FUNCTION verify_department_password IS 'Ověření hesla pro přihlášení do oddílu';
COMMENT ON FUNCTION hash_department_password IS 'Vytvoření bcrypt hashe pro heslo oddílu';

