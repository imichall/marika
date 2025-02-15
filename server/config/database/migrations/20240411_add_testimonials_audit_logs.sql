-- Odstranění existujících triggerů a funkcí
DROP TRIGGER IF EXISTS testimonials_audit_insert ON testimonials;
DROP TRIGGER IF EXISTS testimonials_audit_update ON testimonials;
DROP TRIGGER IF EXISTS testimonials_audit_delete ON testimonials;
DROP FUNCTION IF EXISTS audit_testimonials_insert();
DROP FUNCTION IF EXISTS audit_testimonials_update();
DROP FUNCTION IF EXISTS audit_testimonials_delete();

-- Přidání konfigurace auditování pro reference
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('testimonials', 'create', true),
  ('testimonials', 'update', true),
  ('testimonials', 'delete', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro sekci referencí
INSERT INTO section_translations (section, language, translation)
VALUES ('testimonials', 'cs', 'Reference')
ON CONFLICT (section, language) DO NOTHING;

-- Vytvoření triggeru pro auditování vytvoření reference
CREATE OR REPLACE FUNCTION audit_testimonials_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'testimonials',
    'create'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'autor', NEW.author,
      'zdroj', COALESCE(NEW.source, ''),
      'text', NEW.text
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER testimonials_audit_insert
  AFTER INSERT ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION audit_testimonials_insert();

-- Vytvoření triggeru pro auditování aktualizace reference
CREATE OR REPLACE FUNCTION audit_testimonials_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'testimonials',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'změny', jsonb_build_object(
        'původní_autor', OLD.author,
        'nový_autor', NEW.author,
        'původní_zdroj', COALESCE(OLD.source, ''),
        'nový_zdroj', COALESCE(NEW.source, ''),
        'původní_text', OLD.text,
        'nový_text', NEW.text
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER testimonials_audit_update
  AFTER UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION audit_testimonials_update();

-- Vytvoření triggeru pro auditování smazání reference
CREATE OR REPLACE FUNCTION audit_testimonials_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'testimonials',
    'delete'::audit_action_type,
    OLD.id::text,
    jsonb_build_object(
      'id', OLD.id,
      'autor', OLD.author,
      'zdroj', COALESCE(OLD.source, ''),
      'text', OLD.text
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER testimonials_audit_delete
  BEFORE DELETE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION audit_testimonials_delete();