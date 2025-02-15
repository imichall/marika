-- Odstranění existujících triggerů a funkcí
DROP TRIGGER IF EXISTS choir_groups_audit_insert ON choir_groups;
DROP TRIGGER IF EXISTS choir_groups_audit_update ON choir_groups;
DROP TRIGGER IF EXISTS choir_groups_audit_delete ON choir_groups;
DROP FUNCTION IF EXISTS audit_choir_groups_insert();
DROP FUNCTION IF EXISTS audit_choir_groups_update();
DROP FUNCTION IF EXISTS audit_choir_groups_delete();

-- Přidání konfigurace auditování pro pěvecké skupiny
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('choir_groups', 'create', true),
  ('choir_groups', 'update', true),
  ('choir_groups', 'delete', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro sekci pěveckých skupin
INSERT INTO section_translations (section, language, translation)
VALUES ('choir_groups', 'cs', 'Pěvecké skupiny')
ON CONFLICT (section, language) DO NOTHING;

-- Vytvoření triggeru pro auditování vytvoření skupiny
CREATE OR REPLACE FUNCTION audit_choir_groups_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'choir_groups',
    'create'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'název', NEW.name,
      'popis', COALESCE(NEW.description, ''),
      'obrázek', COALESCE(NEW.image, '')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER choir_groups_audit_insert
  AFTER INSERT ON choir_groups
  FOR EACH ROW
  EXECUTE FUNCTION audit_choir_groups_insert();

-- Vytvoření triggeru pro auditování aktualizace skupiny
CREATE OR REPLACE FUNCTION audit_choir_groups_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'choir_groups',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'změny', jsonb_build_object(
        'původní_název', OLD.name,
        'nový_název', NEW.name,
        'původní_popis', COALESCE(OLD.description, ''),
        'nový_popis', COALESCE(NEW.description, ''),
        'původní_obrázek', COALESCE(OLD.image, ''),
        'nový_obrázek', COALESCE(NEW.image, '')
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER choir_groups_audit_update
  AFTER UPDATE ON choir_groups
  FOR EACH ROW
  EXECUTE FUNCTION audit_choir_groups_update();

-- Vytvoření triggeru pro auditování smazání skupiny
CREATE OR REPLACE FUNCTION audit_choir_groups_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'choir_groups',
    'delete'::audit_action_type,
    OLD.id::text,
    jsonb_build_object(
      'id', OLD.id,
      'název', OLD.name,
      'popis', COALESCE(OLD.description, ''),
      'obrázek', COALESCE(OLD.image, '')
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER choir_groups_audit_delete
  BEFORE DELETE ON choir_groups
  FOR EACH ROW
  EXECUTE FUNCTION audit_choir_groups_delete();

-- Oprava funkce pro aktualizaci skupiny
CREATE OR REPLACE FUNCTION update_choir_group(
  p_id BIGINT,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_image TEXT DEFAULT NULL,
  p_button_link TEXT DEFAULT NULL
) RETURNS choir_groups AS $$
DECLARE
  v_updated_group choir_groups;
BEGIN
  UPDATE choir_groups
  SET
    name = p_name,
    description = p_description,
    image = p_image,
    button_link = p_button_link,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_id
  RETURNING * INTO v_updated_group;

  IF v_updated_group IS NULL THEN
    RAISE EXCEPTION 'Skupina s ID % nebyla nalezena', p_id;
  END IF;

  RETURN v_updated_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Povolení RLS pro tabulku choir_groups
ALTER TABLE choir_groups ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení skupin (může kdokoliv)
CREATE POLICY "Kdokoliv může číst skupiny"
  ON choir_groups
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Politika pro úpravu skupin (pouze uživatelé s oprávněním edit)
CREATE POLICY "Úprava skupin pouze s oprávněním"
  ON choir_groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'choir_groups'
      AND p.action = 'edit'
    )
  );

-- Politika pro vytváření skupin (pouze uživatelé s oprávněním create)
CREATE POLICY "Vytváření skupin pouze s oprávněním"
  ON choir_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'choir_groups'
      AND p.action = 'create'
    )
  );

-- Politika pro mazání skupin (pouze uživatelé s oprávněním delete)
CREATE POLICY "Mazání skupin pouze s oprávněním"
  ON choir_groups
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'choir_groups'
      AND p.action = 'delete'
    )
  );

-- Přidání oprávnění pro skupiny (pokud ještě neexistují)
INSERT INTO permissions (section, action, description)
VALUES
  ('choir_groups', 'view', 'Zobrazení pěveckých skupin'),
  ('choir_groups', 'create', 'Vytváření pěveckých skupin'),
  ('choir_groups', 'edit', 'Úprava pěveckých skupin'),
  ('choir_groups', 'delete', 'Mazání pěveckých skupin')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro oprávnění
INSERT INTO permission_translations (section, action, language, translation)
VALUES
  ('choir_groups', 'view', 'cs', 'Zobrazení pěveckých skupin'),
  ('choir_groups', 'create', 'cs', 'Vytváření pěveckých skupin'),
  ('choir_groups', 'edit', 'cs', 'Úprava pěveckých skupin'),
  ('choir_groups', 'delete', 'cs', 'Mazání pěveckých skupin')
ON CONFLICT (section, action, language) DO NOTHING;