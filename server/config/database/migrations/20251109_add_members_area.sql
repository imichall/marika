-- Členská sekce – repertoár, členové, dokumenty
-- Vytvoření tabulek, oprávnění a RLS politik

-- ODEBRÁNÍ EXISTUJÍCÍCH POLITIK PRO OPAKOVANÉ SPUŠTĚNÍ MIGRACE (IDEMPOTENTNÍ)
DO $$
BEGIN
  EXECUTE '
    DROP POLICY IF EXISTS "Repertoire items view" ON repertoire_items;
    DROP POLICY IF EXISTS "Repertoire items manage" ON repertoire_items;
    DROP POLICY IF EXISTS "Repertoire items delete" ON repertoire_items;
    DROP POLICY IF EXISTS "Repertoire files view" ON repertoire_files;
    DROP POLICY IF EXISTS "Repertoire files manage" ON repertoire_files;
    DROP POLICY IF EXISTS "Repertoire files delete" ON repertoire_files;
    DROP POLICY IF EXISTS "Member directory view" ON member_directory;
    DROP POLICY IF EXISTS "Member directory manage" ON member_directory;
    DROP POLICY IF EXISTS "Member directory delete" ON member_directory;
    DROP POLICY IF EXISTS "Member resources view" ON member_resources;
    DROP POLICY IF EXISTS "Member resources manage" ON member_resources;
    DROP POLICY IF EXISTS "Member resources delete" ON member_resources;
  ';
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- TABULKA PRO REPERTOÁR
CREATE TABLE IF NOT EXISTS repertoire_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TABULKA PRO SOUBORY REPERTOÁRU
CREATE TABLE IF NOT EXISTS repertoire_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repertoire_id UUID NOT NULL REFERENCES repertoire_items(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT,
  voice_part TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TABULKA PRO SEZNAM ČLENŮ SBORU
CREATE TABLE IF NOT EXISTS member_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  voice_part TEXT,
  joined_at DATE,
  left_at DATE,
  email TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TABULKA PRO ČLENSKÉ DOKUMENTY
CREATE TABLE IF NOT EXISTS member_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXY PRO RYCHLÉ VYHLEDÁVÁNÍ
CREATE INDEX IF NOT EXISTS idx_repertoire_items_title ON repertoire_items USING gin (to_tsvector('simple', coalesce(title, '')));
CREATE INDEX IF NOT EXISTS idx_repertoire_items_authors ON repertoire_items USING gin (to_tsvector('simple', coalesce(authors, '')));
CREATE INDEX IF NOT EXISTS idx_repertoire_files_repertoire_id ON repertoire_files(repertoire_id);
CREATE INDEX IF NOT EXISTS idx_member_directory_full_name ON member_directory USING gin (to_tsvector('simple', coalesce(full_name, '')));
CREATE INDEX IF NOT EXISTS idx_member_directory_voice_part ON member_directory(voice_part);
CREATE INDEX IF NOT EXISTS idx_member_resources_title ON member_resources USING gin (to_tsvector('simple', coalesce(title, '')));
CREATE INDEX IF NOT EXISTS idx_member_resources_category ON member_resources(category);

-- AKTUALIZAČNÍ TRIGGERY
DROP TRIGGER IF EXISTS set_repertoire_items_updated_at ON repertoire_items;
CREATE TRIGGER set_repertoire_items_updated_at
  BEFORE UPDATE ON repertoire_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_member_directory_updated_at ON member_directory;
CREATE TRIGGER set_member_directory_updated_at
  BEFORE UPDATE ON member_directory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_member_resources_updated_at ON member_resources;
CREATE TRIGGER set_member_resources_updated_at
  BEFORE UPDATE ON member_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- POVOLENÍ RLS
ALTER TABLE repertoire_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE repertoire_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_resources ENABLE ROW LEVEL SECURITY;

-- POLITIKY PRO REPERTOÁR
CREATE POLICY "Repertoire items view"
  ON repertoire_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action = 'view'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Repertoire items manage"
  ON repertoire_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
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
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Repertoire items delete"
  ON repertoire_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action = 'delete'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Repertoire files view"
  ON repertoire_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action = 'view'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Repertoire files manage"
  ON repertoire_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Repertoire files delete"
  ON repertoire_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action IN ('edit', 'delete')
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

-- POLITIKY PRO ČLENSKÝ SEZNAM
CREATE POLICY "Member directory view"
  ON member_directory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_directory'
        AND p.action = 'view'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Member directory manage"
  ON member_directory
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_directory'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
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
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_directory'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Member directory delete"
  ON member_directory
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_directory'
        AND p.action = 'delete'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

-- POLITIKY PRO DOKUMENTY
CREATE POLICY "Member resources view"
  ON member_resources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_resources'
        AND p.action = 'view'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Member resources manage"
  ON member_resources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_resources'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
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
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_resources'
        AND p.action IN ('create', 'edit')
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

CREATE POLICY "Member resources delete"
  ON member_resources
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_resources'
        AND p.action = 'delete'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
  );

-- ZÁZNAMY V TABULCE PERMISSIONS
INSERT INTO permissions (section, action, description)
VALUES
  ('repertoire', 'view', 'Zobrazení repertoáru'),
  ('repertoire', 'create', 'Přidávání skladeb do repertoáru'),
  ('repertoire', 'edit', 'Úprava skladeb v repertoáru'),
  ('repertoire', 'delete', 'Mazání skladeb z repertoáru'),
  ('member_directory', 'view', 'Zobrazení seznamu členů'),
  ('member_directory', 'create', 'Přidávání členů'),
  ('member_directory', 'edit', 'Úprava informací o členech'),
  ('member_directory', 'delete', 'Mazání členů'),
  ('member_resources', 'view', 'Zobrazení dokumentů ke stažení'),
  ('member_resources', 'create', 'Nahrávání dokumentů ke stažení'),
  ('member_resources', 'edit', 'Úprava metadat dokumentů'),
  ('member_resources', 'delete', 'Mazání dokumentů ke stažení'),
  ('members_area', 'view', 'Přístup do členské sekce')
ON CONFLICT (section, action) DO NOTHING;

-- PŘIŘAZENÍ OPRÁVNĚNÍ ADMINŮM
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
CROSS JOIN permissions p
WHERE ur.role = 'admin'
  AND p.section IN ('repertoire', 'member_directory', 'member_resources', 'members_area')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- PŘIŘAZENÍ OPRÁVNĚNÍ EDITORŮM (ZÁKLADNÍ SPRÁVA REPERTOÁRU A DOKUMENTŮ)
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
JOIN permissions p ON p.section IN ('repertoire', 'member_resources', 'members_area', 'member_directory')
WHERE ur.role = 'editor'
  AND (
    (p.section = 'repertoire' AND p.action IN ('view', 'create', 'edit'))
    OR (p.section = 'member_directory' AND p.action IN ('view', 'create', 'edit', 'delete'))
    OR (p.section = 'member_resources' AND p.action IN ('view', 'create', 'edit'))
    OR (p.section = 'members_area' AND p.action = 'view')
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ULOŽENÍ PRÁVA POUZE PRO ZOBRAZENÍ VIEWERŮM
INSERT INTO user_permissions (role_id, permission_id)
SELECT ur.id, p.id
FROM user_roles ur
JOIN permissions p ON p.section IN ('repertoire', 'member_directory', 'member_resources', 'members_area')
WHERE ur.role = 'viewer'
  AND p.action = 'view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- VYTVOŘENÍ PRIVÁTNÍCH BUCKETŮ VE STORAGE (POKUD NEEXISTUJÍ)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('repertoire', 'repertoire', FALSE, 104857600)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      name = EXCLUDED.name;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('member-resources', 'member-resources', FALSE, 104857600)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      name = EXCLUDED.name;

-- STORAGE.POLICIES PRO NOVÉ BUCKETY
DROP POLICY IF EXISTS "Repertoire files view policy" ON storage.objects;
DROP POLICY IF EXISTS "Repertoire files manage policy" ON storage.objects;
DROP POLICY IF EXISTS "Repertoire files delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources view policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources manage policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources delete policy" ON storage.objects;

CREATE POLICY "Repertoire files view policy"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'repertoire' AND (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'repertoire'
        AND p.action = 'view'
    )
  ));

CREATE POLICY "Repertoire files manage policy"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'repertoire' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN user_permissions up ON up.role_id = ur.id
        JOIN permissions p ON p.id = up.permission_id
        WHERE ur.email = auth.jwt() ->> 'email'
          AND p.section = 'repertoire'
          AND p.action IN ('create', 'edit')
      )
    )
  );

CREATE POLICY "Repertoire files delete policy"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'repertoire' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN user_permissions up ON up.role_id = ur.id
        JOIN permissions p ON p.id = up.permission_id
        WHERE ur.email = auth.jwt() ->> 'email'
          AND p.section = 'repertoire'
          AND p.action IN ('edit', 'delete')
      )
    )
  );

CREATE POLICY "Member resources view policy"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'member-resources' AND (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role = 'admin'
    )
    OR EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON up.role_id = ur.id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
        AND p.section = 'member_resources'
        AND p.action = 'view'
    )
  ));

CREATE POLICY "Member resources manage policy"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'member-resources' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN user_permissions up ON up.role_id = ur.id
        JOIN permissions p ON p.id = up.permission_id
        WHERE ur.email = auth.jwt() ->> 'email'
          AND p.section = 'member_resources'
          AND p.action IN ('create', 'edit')
      )
    )
  );

CREATE POLICY "Member resources delete policy"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'member-resources' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role = 'admin'
      )
      OR EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN user_permissions up ON up.role_id = ur.id
        JOIN permissions p ON p.id = up.permission_id
        WHERE ur.email = auth.jwt() ->> 'email'
          AND p.section = 'member_resources'
          AND p.action IN ('edit', 'delete')
      )
    )
  );

