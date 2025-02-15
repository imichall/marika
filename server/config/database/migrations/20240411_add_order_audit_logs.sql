-- Odstranění existujících triggerů a funkcí
DROP TRIGGER IF EXISTS ticket_orders_audit_insert ON ticket_orders;
DROP TRIGGER IF EXISTS ticket_orders_audit_update ON ticket_orders;
DROP TRIGGER IF EXISTS ticket_orders_audit_delete ON ticket_orders;
DROP FUNCTION IF EXISTS audit_ticket_orders_insert();
DROP FUNCTION IF EXISTS audit_ticket_orders_update();
DROP FUNCTION IF EXISTS audit_ticket_orders_delete();

-- Přidání konfigurace auditování pro objednávky vstupenek
INSERT INTO audit_config (section, action, is_enabled)
VALUES
  ('ticket_orders', 'create', true),
  ('ticket_orders', 'update', true),
  ('ticket_orders', 'delete', true)
ON CONFLICT (section, action) DO NOTHING;

-- Přidání překladů pro sekci objednávek vstupenek
INSERT INTO section_translations (section, language, translation)
VALUES ('ticket_orders', 'cs', 'Objednávky vstupenek')
ON CONFLICT (section, language) DO NOTHING;

-- Vytvoření triggeru pro auditování vytvoření objednávky vstupenek
CREATE OR REPLACE FUNCTION audit_ticket_orders_insert()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'ticket_orders',
    'create'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'order_id', NEW.id,
      'customer_name', NEW.customer_name,
      'customer_email', NEW.customer_email,
      'total_price', NEW.total_price,
      'payment_status', NEW.payment_status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ticket_orders_audit_insert
  AFTER INSERT ON ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_ticket_orders_insert();

-- Vytvoření triggeru pro auditování aktualizace objednávky vstupenek
CREATE OR REPLACE FUNCTION audit_ticket_orders_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'ticket_orders',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'order_id', NEW.id,
      'changes', jsonb_build_object(
        'původní_stav', OLD.payment_status,
        'nový_stav', NEW.payment_status,
        'původní_částka', OLD.total_price,
        'nová_částka', NEW.total_price
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ticket_orders_audit_update
  AFTER UPDATE ON ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_ticket_orders_update();

-- Vytvoření triggeru pro auditování smazání objednávky vstupenek
CREATE OR REPLACE FUNCTION audit_ticket_orders_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_audit_log(
    auth.jwt() ->> 'email',
    'ticket_orders',
    'delete'::audit_action_type,
    OLD.id::text,
    jsonb_build_object(
      'order_id', OLD.id,
      'jméno_zákazníka', OLD.customer_name,
      'email_zákazníka', OLD.customer_email,
      'celková_částka', OLD.total_price,
      'stav', OLD.payment_status
    )
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ticket_orders_audit_delete
  BEFORE DELETE ON ticket_orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_ticket_orders_delete();