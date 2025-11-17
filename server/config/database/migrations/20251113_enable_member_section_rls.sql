-- Povolení čtení pro všechny tabulky členské sekce
-- Middleware kontroluje oprávnění na úrovni aplikace, takže zde povolíme čtení všem

-- 1. member_users - správa členů oddílů
DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_users;
CREATE POLICY "Enable read access for all users"
ON public.member_users FOR SELECT
TO public
USING (true);

-- 2. member_departments - oddíly
DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_departments;
CREATE POLICY "Enable read access for all users"
ON public.member_departments FOR SELECT
TO public
USING (true);

-- 3. member_login_logs - historie přihlášení
DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_login_logs;
CREATE POLICY "Enable read access for all users"
ON public.member_login_logs FOR SELECT
TO public
USING (true);

-- 4. repertoire_items - repertoár
DROP POLICY IF EXISTS "Enable read access for all users" ON public.repertoire_items;
CREATE POLICY "Enable read access for all users"
ON public.repertoire_items FOR SELECT
TO public
USING (true);

-- 5. repertoire_files - soubory repertoáru
DROP POLICY IF EXISTS "Enable read access for all users" ON public.repertoire_files;
CREATE POLICY "Enable read access for all users"
ON public.repertoire_files FOR SELECT
TO public
USING (true);

-- 6. member_directory - seznam členů sboru
DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_directory;
CREATE POLICY "Enable read access for all users"
ON public.member_directory FOR SELECT
TO public
USING (true);

-- 7. member_resources - dokumenty ke stažení
DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_resources;
CREATE POLICY "Enable read access for all users"
ON public.member_resources FOR SELECT
TO public
USING (true);

-- Ověření - zobraz všechny SELECT policies pro členskou sekci
SELECT
    tablename,
    policyname,
    cmd,
    'true'::text as qual_simplified
FROM pg_policies
WHERE tablename IN (
    'member_users',
    'member_departments',
    'member_login_logs',
    'repertoire_items',
    'repertoire_files',
    'member_directory',
    'member_resources'
)
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

