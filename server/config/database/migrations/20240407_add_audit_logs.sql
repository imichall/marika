-- Vytvoření ENUM typu pro akce
CREATE TYPE audit_action_type AS ENUM (
  'create',
  'update',
  'delete',
  'view',
  'approve',
  'reject'
);

-- Vytvoření tabulky pro překlady sekcí
CREATE TABLE IF NOT EXISTS section_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  language VARCHAR(2) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section, language)
);

-- Vytvoření tabulky pro překlady oprávnění
CREATE TABLE IF NOT EXISTS permission_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  language VARCHAR(2) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section, action, language)
);

-- Trigger pro aktualizaci updated_at pro section_translations
CREATE TRIGGER set_section_translations_updated_at
  BEFORE UPDATE ON section_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pro aktualizaci updated_at pro permission_translations
CREATE TRIGGER set_permission_translations_updated_at
  BEFORE UPDATE ON permission_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vytvoření tabulky pro konfiguraci auditování
CREATE TABLE audit_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  action audit_action_type NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section, action)
);

-- Vytvoření tabulky pro auditní záznamy
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  section VARCHAR(50) NOT NULL,
  action audit_action_type NOT NULL,
  entity_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Přidání indexů pro rychlejší vyhledávání
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_section ON audit_logs(section);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Trigger pro aktualizaci updated_at
CREATE TRIGGER set_audit_config_updated_at
  BEFORE UPDATE ON audit_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS politiky pro audit_config
ALTER TABLE audit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit config is viewable by users with permissions"
  ON audit_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'audit'
      AND p.action = 'view'
    )
  );

CREATE POLICY "Audit config is manageable by users with permissions"
  ON audit_config FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'audit'
      AND p.action = 'manage'
    )
  );

-- RLS politiky pro audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by users with permissions"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'audit'
      AND p.action = 'view'
    )
  );

-- Funkce pro vytvoření auditního záznamu
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_email VARCHAR,
  p_section VARCHAR,
  p_action audit_action_type,
  p_entity_id VARCHAR,
  p_details JSONB
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Kontrola, zda je auditování pro danou sekci a akci povoleno
  IF EXISTS (
    SELECT 1 FROM audit_config
    WHERE section = p_section
    AND action = p_action
    AND is_enabled = true
  ) THEN
    -- Vytvoření auditního záznamu
    INSERT INTO audit_logs (
      user_email,
      section,
      action,
      entity_id,
      details
    )
    VALUES (
      p_user_email,
      p_section,
      p_action,
      p_entity_id,
      p_details
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
  END IF;

  RETURN NULL;
END;
$$;

-- Přidání oprávnění pro audit
INSERT INTO permissions (section, action, description)
VALUES
  ('audit', 'view', 'Zobrazení auditních záznamů'),
  ('audit', 'manage', 'Správa konfigurace auditování')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů
INSERT INTO section_translations (section, language, translation)
VALUES ('audit', 'cs', 'Auditní záznamy');

INSERT INTO permission_translations (section, action, language, translation)
VALUES
  ('audit', 'view', 'cs', 'Zobrazení auditních záznamů'),
  ('audit', 'manage', 'cs', 'Správa konfigurace auditování');

-- Výchozí konfigurace auditování
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('concerts', 'create', true),
  ('concerts', 'update', true),
  ('concerts', 'delete', true),
  ('gallery', 'create', true),
  ('gallery', 'delete', true),
  ('testimonials', 'create', true),
  ('testimonials', 'delete', true),
  ('form_messages', 'approve', true),
  ('form_messages', 'reject', true),
  ('form_messages', 'delete', true),
  ('users', 'create', true),
  ('users', 'update', true),
  ('users', 'delete', true);