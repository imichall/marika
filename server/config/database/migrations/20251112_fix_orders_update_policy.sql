-- Oprava RLS policy pro UPDATE objednávek
-- Přidání WITH CHECK klauzule, aby bylo možné nastavit is_active = FALSE pro soft delete

-- Odstranění staré policy
DROP POLICY IF EXISTS "Orders are editable by users with edit permission" ON ticket_orders;

-- Vytvoření nové policy s WITH CHECK klauzulí
CREATE POLICY "Orders are editable by users with edit permission"
  ON ticket_orders FOR UPDATE
  USING (
    -- Můžeme aktualizovat pouze aktivní objednávky
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
    -- Povolujeme nastavit jakékoli hodnoty (včetně is_active = FALSE pro soft delete)
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

