-- Oprava RLS policy pro member_departments - povolení INSERT/UPDATE/DELETE pro editory
-- Kontrola oprávnění probíhá na úrovni API, takže zde povolíme INSERT/UPDATE/DELETE
-- pro všechny adminy a editory (middleware kontroluje konkrétní oprávnění)

-- Smažeme starou policy, která povolovala pouze adminům
DROP POLICY IF EXISTS "Member departments manage" ON public.member_departments;

-- Vytvoříme novou policy, která povoluje INSERT/UPDATE/DELETE pro adminy i editory
CREATE POLICY "Member departments manage"
  ON public.member_departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

