-- Přidání sloupce is_archived do tabulky concerts
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Aktualizace RLS politik pro tabulku concerts
DROP POLICY IF EXISTS "Concerts are viewable by all" ON concerts;
DROP POLICY IF EXISTS "Concerts are editable by users with permissions" ON concerts;

-- Politika pro zobrazení koncertů
CREATE POLICY "Concerts are viewable by all"
ON concerts FOR SELECT
USING (
  -- Nearhivované koncerty jsou viditelné pro všechny
  (NOT is_archived)
  OR
  -- Archivované koncerty jsou viditelné pouze pro přihlášené uživatele s oprávněním
  (is_archived AND EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN user_permissions up ON ur.id = up.role_id
    JOIN permissions p ON p.id = up.permission_id
    WHERE ur.email = auth.jwt() ->> 'email'
    AND p.section = 'concerts'
    AND p.action = 'view'
  ))
);

-- Politika pro úpravu koncertů
CREATE POLICY "Concerts are editable by users with permissions"
ON concerts FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN user_permissions up ON ur.id = up.role_id
    JOIN permissions p ON p.id = up.permission_id
    WHERE ur.email = auth.jwt() ->> 'email'
    AND p.section = 'concerts'
    AND p.action IN ('create', 'edit', 'delete')
  )
);

-- Přidání indexu pro rychlejší filtrování
CREATE INDEX IF NOT EXISTS idx_concerts_is_archived ON concerts(is_archived);