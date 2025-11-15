-- Kompletní oprava RLS policies pro všechny member tabulky
-- Povolíme čtení všem uživatelům (i nepřihlášeným)
-- Middleware kontroluje oprávnění na úrovni aplikace

-- 1. member_users - DROP všech starých policies a vytvoření nové
DO $$
BEGIN
    -- Smaž všechny existující SELECT policies
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.member_users;', ' ')
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'member_users'
        AND cmd = 'SELECT'
    );
END $$;

-- Vytvoř novou policy pro member_users
CREATE POLICY "Enable read access for all users"
ON public.member_users FOR SELECT
TO public
USING (true);

-- 2. member_departments - DROP všech starých policies a vytvoření nové
DO $$
BEGIN
    -- Smaž všechny existující SELECT policies
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.member_departments;', ' ')
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'member_departments'
        AND cmd = 'SELECT'
    );
END $$;

-- Vytvoř novou policy pro member_departments
CREATE POLICY "Enable read access for all users"
ON public.member_departments FOR SELECT
TO public
USING (true);

-- 3. member_login_logs - DROP všech starých policies a vytvoření nové
DO $$
BEGIN
    -- Smaž všechny existující SELECT policies
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON public.member_login_logs;', ' ')
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'member_login_logs'
        AND cmd = 'SELECT'
    );
END $$;

-- Vytvoř novou policy pro member_login_logs
CREATE POLICY "Enable read access for all users"
ON public.member_login_logs FOR SELECT
TO public
USING (true);

-- Ověření - zobraz všechny SELECT policies pro member tabulky
SELECT
    tablename,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies
WHERE tablename IN ('member_users', 'member_departments', 'member_login_logs')
AND cmd = 'SELECT'
ORDER BY tablename, policyname;

