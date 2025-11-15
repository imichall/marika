-- Kontrola existujících RLS policies pro member tabulky

-- Zobrazit všechny policies pro member_users
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('member_users', 'member_departments', 'member_login_logs')
ORDER BY tablename, policyname;

