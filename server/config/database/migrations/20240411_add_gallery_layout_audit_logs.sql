-- Odstranění existujících triggerů a funkcí
DROP TRIGGER IF EXISTS gallery_layout_audit_insert ON gallery_layout;
DROP TRIGGER IF EXISTS gallery_layout_audit_update ON gallery_layout;
DROP TRIGGER IF EXISTS gallery_layout_audit_delete ON gallery_layout;
DROP FUNCTION IF EXISTS audit_gallery_layout_insert();
DROP FUNCTION IF EXISTS audit_gallery_layout_update();
DROP FUNCTION IF EXISTS audit_gallery_layout_delete();

-- Přidání konfigurace auditování pro náčrt galerie
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('gallery_layout', 'create', true),
  ('gallery_layout', 'update', true),
  ('gallery_layout', 'delete', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro sekci náčrtu galerie
INSERT INTO section_translations (section, language, translation)
VALUES ('gallery_layout', 'cs', 'Náčrt galerie')
ON CONFLICT (section, language) DO NOTHING;

-- Vytvoření triggeru pro auditování vytvoření pozice v náčrtu
CREATE OR REPLACE FUNCTION audit_gallery_layout_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_image_title TEXT;
BEGIN
  SELECT title INTO v_image_title FROM gallery WHERE id = NEW.image_id;

  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'gallery_layout',
    'create'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'pozice', NEW.position,
      'fotografie', v_image_title
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER gallery_layout_audit_insert
  AFTER INSERT ON gallery_layout
  FOR EACH ROW
  EXECUTE FUNCTION audit_gallery_layout_insert();

-- Vytvoření triggeru pro auditování aktualizace pozice v náčrtu
CREATE OR REPLACE FUNCTION audit_gallery_layout_update()
RETURNS TRIGGER AS $$
DECLARE
  v_old_image_title TEXT;
  v_new_image_title TEXT;
BEGIN
  SELECT title INTO v_old_image_title FROM gallery WHERE id = OLD.image_id;
  SELECT title INTO v_new_image_title FROM gallery WHERE id = NEW.image_id;

  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'gallery_layout',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'změny', jsonb_build_object(
        'původní_pozice', OLD.position,
        'nová_pozice', NEW.position,
        'původní_fotografie', v_old_image_title,
        'nová_fotografie', v_new_image_title
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER gallery_layout_audit_update
  AFTER UPDATE ON gallery_layout
  FOR EACH ROW
  EXECUTE FUNCTION audit_gallery_layout_update();

-- Vytvoření triggeru pro auditování smazání pozice v náčrtu
CREATE OR REPLACE FUNCTION audit_gallery_layout_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_image_title TEXT;
BEGIN
  SELECT title INTO v_image_title FROM gallery WHERE id = OLD.image_id;

  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'gallery_layout',
    'delete'::audit_action_type,
    OLD.id::text,
    jsonb_build_object(
      'id', OLD.id,
      'pozice', OLD.position,
      'fotografie', v_image_title
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER gallery_layout_audit_delete
  BEFORE DELETE ON gallery_layout
  FOR EACH ROW
  EXECUTE FUNCTION audit_gallery_layout_delete();

-- Přidání oprávnění pro náčrt galerie (pokud ještě neexistují)
INSERT INTO permissions (section, action, description)
VALUES
  ('gallery_layout', 'view', 'Zobrazení náčrtu galerie'),
  ('gallery_layout', 'edit', 'Úprava náčrtu galerie')
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro oprávnění
INSERT INTO permission_translations (section, action, language, translation)
VALUES
  ('gallery_layout', 'view', 'cs', 'Zobrazení náčrtu galerie'),
  ('gallery_layout', 'edit', 'cs', 'Úprava náčrtu galerie')
ON CONFLICT (section, action, language) DO NOTHING;