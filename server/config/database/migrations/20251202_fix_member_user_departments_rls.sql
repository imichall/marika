-- Oprava RLS policy pro member_user_departments - povolení čtení všem
-- Middleware kontroluje oprávnění na úrovni aplikace, takže zde povolíme čtení všem

-- Smažeme staré policies
DROP POLICY IF EXISTS "Member user departments view" ON public.member_user_departments;
DROP POLICY IF EXISTS "Member user departments manage" ON public.member_user_departments;

-- Vytvoříme novou policy pro SELECT, která povoluje čtení všem
CREATE POLICY "Enable read access for all users"
ON public.member_user_departments FOR SELECT
TO public
USING (true);

-- Policy pro INSERT/UPDATE/DELETE zůstává jen pro authenticated admins/editors
CREATE POLICY "Member user departments manage"
  ON public.member_user_departments
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

