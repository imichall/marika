-- Oprava RLS policies pro member_users a member_departments
-- Pokud policies neexistují, vytvoříme je
-- Pokud existují, přeskočíme

-- 1. member_users - povolení čtení pro všechny
DO $$
BEGIN
    -- Smažeme staré policies pokud existují
    DROP POLICY IF EXISTS "Enable read access for admins/editors" ON public.member_users;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.member_users;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_users;

    -- Vytvoříme novou policy
    CREATE POLICY "Enable read access for all users"
    ON public.member_users FOR SELECT
    TO public
    USING (true);

EXCEPTION WHEN duplicate_object THEN
    -- Policy už existuje, není co řešit
    RAISE NOTICE 'Policy for member_users already exists, skipping';
END $$;

-- 2. member_departments - povolení čtení pro všechny
DO $$
BEGIN
    -- Smažeme staré policies pokud existují
    DROP POLICY IF EXISTS "Enable read access for admins/editors" ON public.member_departments;
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.member_departments;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.member_departments;

    -- Vytvoříme novou policy
    CREATE POLICY "Enable read access for all users"
    ON public.member_departments FOR SELECT
    TO public
    USING (true);

EXCEPTION WHEN duplicate_object THEN
    -- Policy už existuje, není co řešit
    RAISE NOTICE 'Policy for member_departments already exists, skipping';
END $$;

