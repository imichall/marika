-- Přidání soft delete pro objednávky
-- Objednávky se nebudou mazat, ale pouze deaktivovat pomocí sloupce is_active

-- 1. Přidání sloupce is_active do tabulky ticket_orders
ALTER TABLE ticket_orders
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- 2. Nastavení všech existujících objednávek jako aktivní (pro jistotu)
UPDATE ticket_orders
SET is_active = TRUE
WHERE is_active IS NULL;

-- 3. Vytvoření indexu pro rychlejší filtrování
CREATE INDEX IF NOT EXISTS idx_ticket_orders_is_active ON ticket_orders(is_active);

-- 4. Aktualizace RLS policy pro SELECT - zobrazit pouze aktivní objednávky
DROP POLICY IF EXISTS "Orders are viewable by users with view permission" ON ticket_orders;
CREATE POLICY "Orders are viewable by users with view permission"
  ON ticket_orders FOR SELECT
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'orders'
      AND p.action = 'view'
    )
  );

-- 5. Aktualizace RLS policy pro UPDATE - umožnit aktualizaci pouze aktivních objednávek
-- USING kontroluje, zda můžeme aktualizovat řádek (musí být aktivní)
-- WITH CHECK kontroluje, zda můžeme nastavit nové hodnoty (povolujeme i is_active = FALSE pro soft delete)
DROP POLICY IF EXISTS "Orders are editable by users with edit permission" ON ticket_orders;
CREATE POLICY "Orders are editable by users with edit permission"
  ON ticket_orders FOR UPDATE
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'orders'
      AND p.action IN ('edit', 'complete', 'cancel', 'delete')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'orders'
      AND p.action IN ('edit', 'complete', 'cancel', 'delete')
    )
  );

-- 6. Odstranění RLS policy pro DELETE - aplikace bude používat UPDATE místo DELETE
DROP POLICY IF EXISTS "Users can delete orders with permission" ON ticket_orders;

-- Poznámka: Aplikace nyní používá UPDATE s is_active = FALSE místo DELETE
-- RLS policy pro UPDATE už zahrnuje oprávnění 'delete', takže není potřeba samostatná DELETE policy

-- 7. Aktualizace audit triggeru pro soft delete
-- Místo DELETE logu vytvoříme UPDATE log s is_active = FALSE
CREATE OR REPLACE FUNCTION audit_ticket_orders_soft_delete()
RETURNS TRIGGER AS $$
DECLARE
  v_user_email VARCHAR;
BEGIN
  -- Get user email from JWT if available, otherwise use a default value
  v_user_email := COALESCE(auth.jwt() ->> 'email', 'anonymous@system');

  -- Logujeme jako UPDATE s is_active = FALSE (soft delete)
  PERFORM create_audit_log(
    v_user_email,
    'ticket_orders',
    'update'::audit_action_type,
    NEW.id::text,
    jsonb_build_object(
      'order_id', NEW.id,
      'action', 'soft_delete',
      'is_active', false,
      'původní_stav', OLD.is_active,
      'nový_stav', NEW.is_active,
      'jméno_zákazníka', NEW.customer_name,
      'email_zákazníka', NEW.customer_email,
      'celková_částka', NEW.total_price,
      'stav_platby', NEW.payment_status
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aktualizace triggeru pro auditování soft delete
DROP TRIGGER IF EXISTS ticket_orders_audit_delete ON ticket_orders;
CREATE TRIGGER ticket_orders_audit_soft_delete
  AFTER UPDATE ON ticket_orders
  FOR EACH ROW
  WHEN (OLD.is_active = TRUE AND NEW.is_active = FALSE)
  EXECUTE FUNCTION audit_ticket_orders_soft_delete();

