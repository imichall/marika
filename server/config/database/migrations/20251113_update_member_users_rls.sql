-- Aktualizace RLS policies pro member_users, aby členové oddílů mohli číst data
-- Middleware kontroluje oprávnění na úrovni aplikace, takže zde povolíme čtení všem

-- Nejprve smažeme starou policy pro SELECT (pokud existuje)
DROP POLICY IF EXISTS "Enable read access for admins/editors" ON public.member_users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.member_users;

-- Vytvoříme novou policy, která povoluje čtení všem (middleware kontroluje oprávnění)
-- To umožní oddílům načítat data přes Supabase client
CREATE POLICY "Enable read access for all users"
ON public.member_users FOR SELECT
TO public
USING (true);

-- Policies pro INSERT, UPDATE, DELETE zůstávají jen pro authenticated admins
-- (ty už by měly existovat z předchozí migrace)

