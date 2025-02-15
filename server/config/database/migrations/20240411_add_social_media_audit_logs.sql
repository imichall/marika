-- Odstranění existujících triggerů a funkcí
DROP TRIGGER IF EXISTS social_media_audit_insert ON social_media;
DROP TRIGGER IF EXISTS social_media_audit_update ON social_media;
DROP TRIGGER IF EXISTS social_media_audit_delete ON social_media;
DROP FUNCTION IF EXISTS audit_social_media_insert();
DROP FUNCTION IF EXISTS audit_social_media_update();
DROP FUNCTION IF EXISTS audit_social_media_delete();

-- Přidání konfigurace auditování pro sociální sítě
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('social_media', 'create', true),
  ('social_media', 'update', true),
  ('social_media', 'delete', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro sekci sociálních sítí
INSERT INTO section_translations (section, language, translation)
VALUES ('social_media', 'cs', 'Sociální sítě')
ON CONFLICT (section, language) DO NOTHING;

-- Vytvoření triggeru pro auditování vytvoření sociální sítě
CREATE OR REPLACE FUNCTION audit_social_media_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'social_media',
    'create'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'platforma', NEW.platform,
      'url', NEW.url,
      'těleso', CASE
        WHEN NEW.choir_group_id IS NULL THEN 'Globální'
        ELSE (SELECT name FROM choir_groups WHERE id = NEW.choir_group_id)
      END
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER social_media_audit_insert
  AFTER INSERT ON social_media
  FOR EACH ROW
  EXECUTE FUNCTION audit_social_media_insert();

-- Vytvoření triggeru pro auditování aktualizace sociální sítě
CREATE OR REPLACE FUNCTION audit_social_media_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'social_media',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'id', NEW.id,
      'změny', jsonb_build_object(
        'původní_platforma', OLD.platform,
        'nová_platforma', NEW.platform,
        'původní_url', OLD.url,
        'nová_url', NEW.url,
        'původní_těleso', CASE
          WHEN OLD.choir_group_id IS NULL THEN 'Globální'
          ELSE (SELECT name FROM choir_groups WHERE id = OLD.choir_group_id)
        END,
        'nové_těleso', CASE
          WHEN NEW.choir_group_id IS NULL THEN 'Globální'
          ELSE (SELECT name FROM choir_groups WHERE id = NEW.choir_group_id)
        END
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER social_media_audit_update
  AFTER UPDATE ON social_media
  FOR EACH ROW
  EXECUTE FUNCTION audit_social_media_update();

-- Vytvoření triggeru pro auditování smazání sociální sítě
CREATE OR REPLACE FUNCTION audit_social_media_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'social_media',
    'delete'::audit_action_type,
    OLD.id::text,
    jsonb_build_object(
      'id', OLD.id,
      'platforma', OLD.platform,
      'url', OLD.url,
      'těleso', CASE
        WHEN OLD.choir_group_id IS NULL THEN 'Globální'
        ELSE (SELECT name FROM choir_groups WHERE id = OLD.choir_group_id)
      END
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER social_media_audit_delete
  BEFORE DELETE ON social_media
  FOR EACH ROW
  EXECUTE FUNCTION audit_social_media_delete();