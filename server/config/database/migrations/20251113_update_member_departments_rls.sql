-- Aktualizace RLS policies pro member_departments, aby oddíloví členové mohli číst data
-- Middleware kontroluje oprávnění na úrovni aplikace, takže zde povolíme čtení všem

-- Smažeme starou policy pro SELECT (pokud existuje)
DROP POLICY IF EXISTS "Enable read access for admins/editors" ON public.member_departments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.member_departments;

-- Vytvoříme novou policy, která povoluje čtení všem (middleware kontroluje oprávnění)
CREATE POLICY "Enable read access for all users"
ON public.member_departments FOR SELECT
TO public
USING (true);

-- Policies pro INSERT, UPDATE, DELETE zůstávají jen pro authenticated admins
-- (ty už by měly existovat z předchozí migrace)

