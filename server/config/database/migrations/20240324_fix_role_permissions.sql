-- Funkce pro kontrolu přístupu do administrace
CREATE OR REPLACE FUNCTION can_access_admin()
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE email = auth.jwt() ->> 'email'
  );
END;
$$;

-- Funkce pro získání oprávnění role
create or replace function get_role_permissions(p_role user_role_type)
returns table (
  section varchar(50),
  action permission_action_type
)
security definer
set search_path = public
language plpgsql
as $$
begin
  -- Pro adminy vrátíme všechna oprávnění
  if exists (
    select 1 from user_roles
    where email = auth.jwt() ->> 'email'
    and role = 'admin'
  ) then
    return query
      select p.section, p.action
      from permissions p;
  else
    -- Pro ostatní role vrátíme jejich specifická oprávnění
    return query
      select distinct p.section, p.action
      from permissions p
      join user_permissions up on p.id = up.permission_id
      join user_roles ur on ur.id = up.role_id
      where ur.email = auth.jwt() ->> 'email';
  end if;
end;
$$;

-- Funkce pro nastavení oprávnění role
create or replace function set_role_permissions(
  p_email VARCHAR,
  p_role user_role_type,
  p_permissions JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Kontrola, zda je uživatel admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE email = auth.jwt() ->> 'email'
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can manage roles and permissions';
  END IF;

  -- Vložení nebo aktualizace role
  INSERT INTO user_roles (email, role)
  VALUES (p_email, p_role)
  ON CONFLICT (email)
  DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP
  RETURNING id INTO v_role_id;

  -- Smazání starých oprávnění
  DELETE FROM user_permissions WHERE role_id = v_role_id;

  -- Vložení nových oprávnění
  INSERT INTO user_permissions (role_id, permission_id)
  SELECT v_role_id, p.id
  FROM permissions p
  WHERE (p.section, p.action::text) IN (
    SELECT value->>'section', value->>'action'
    FROM jsonb_array_elements(p_permissions)
  );

  RETURN v_role_id;
END;
$$;

-- Odstranění všech existujících politik
DROP POLICY IF EXISTS "Users can manage their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON user_roles;
DROP POLICY IF EXISTS "Only admins can modify roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_roles;
DROP POLICY IF EXISTS "Enable write access for admins" ON user_roles;

-- Nejjednodušší možné politiky bez rekurze
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON user_roles
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Odstranění všech existujících politik pro user_permissions
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Anyone can read permissions" ON user_permissions;
DROP POLICY IF EXISTS "Only admins can modify permissions" ON user_permissions;
DROP POLICY IF EXISTS "Users can view all permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage permissions" ON user_permissions;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_permissions;
DROP POLICY IF EXISTS "Enable write access for admins" ON user_permissions;

-- Nejjednodušší možné politiky pro user_permissions
ALTER TABLE user_permissions FORCE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for authenticated users"
  ON user_permissions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Přidání vašeho účtu jako admin
INSERT INTO user_roles (email, role)
VALUES ('iimichal.svoboda@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';