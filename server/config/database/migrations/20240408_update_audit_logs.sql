-- Přidání nových hodnot do ENUM typu audit_action_type
DO $$
BEGIN
  ALTER TYPE audit_action_type ADD VALUE IF NOT EXISTS 'archive';
  ALTER TYPE audit_action_type ADD VALUE IF NOT EXISTS 'manage';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

BEGIN;
-- Nejprve odstraníme existující politiku
DROP POLICY IF EXISTS "Audit logs can be created by authenticated users" ON audit_logs;

-- Pak vytvoříme novou politiku
CREATE POLICY "Audit logs can be created by authenticated users"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Přidání chybějících konfigurací pro auditování
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  -- Koncerty
  ('concerts', 'archive', true),
  ('concerts', 'view', true),

  -- Galerie
  ('gallery', 'update', true),
  ('gallery', 'view', true),

  -- Reference
  ('testimonials', 'update', true),
  ('testimonials', 'view', true),

  -- Zprávy z formuláře
  ('form_messages', 'create', true),
  ('form_messages', 'update', true),
  ('form_messages', 'view', true),

  -- Uživatelé
  ('users', 'view', true),

  -- Oprávnění
  ('permissions', 'create', true),
  ('permissions', 'update', true),
  ('permissions', 'delete', true),
  ('permissions', 'view', true),

  -- Kontakty
  ('contacts', 'create', true),
  ('contacts', 'update', true),
  ('contacts', 'delete', true),
  ('contacts', 'view', true),

  -- Skupiny
  ('choir_groups', 'create', true),
  ('choir_groups', 'update', true),
  ('choir_groups', 'delete', true),
  ('choir_groups', 'view', true),

  -- Sociální sítě
  ('social_media', 'create', true),
  ('social_media', 'update', true),
  ('social_media', 'delete', true),
  ('social_media', 'view', true),

  -- Systémová nastavení
  ('settings', 'create', true),
  ('settings', 'update', true),
  ('settings', 'delete', true),
  ('settings', 'view', true),
  ('settings', 'manage', true),

  -- Audit
  ('audit', 'view', true),
  ('audit', 'manage', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro nové sekce
INSERT INTO section_translations (section, language, translation)
VALUES
  ('users', 'cs', 'Uživatelé'),
  ('permissions', 'cs', 'Oprávnění'),
  ('contacts', 'cs', 'Kontakty'),
  ('choir_groups', 'cs', 'Skupiny'),
  ('social_media', 'cs', 'Sociální sítě'),
  ('settings', 'cs', 'Systémová nastavení')
ON CONFLICT (section, language) DO NOTHING;
COMMIT;