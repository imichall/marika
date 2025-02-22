-- Vytvoření tabulky pro archivy chatu
CREATE TABLE IF NOT EXISTS chat_archives (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    messages JSONB NOT NULL,
    message_count INTEGER NOT NULL
);

-- Vytvoření tabulky pro uživatele chatu
DROP TABLE IF EXISTS chat_users;
CREATE TABLE chat_users (
    email TEXT PRIMARY KEY REFERENCES user_roles(email) ON DELETE CASCADE,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Přidání RLS politik
ALTER TABLE chat_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_users ENABLE ROW LEVEL SECURITY;

-- Odstranění existujících politik
DROP POLICY IF EXISTS "Admins can manage chat archives" ON chat_archives;
DROP POLICY IF EXISTS "Admins can manage chat users" ON chat_users;
DROP POLICY IF EXISTS "Authenticated users can read chat users" ON chat_users;

-- Politiky pro chat_archives
CREATE POLICY "Admins can manage chat archives"
    ON chat_archives
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN user_permissions up ON ur.id = up.role_id
            JOIN permissions p ON up.permission_id = p.id
            WHERE ur.email = auth.jwt()->>'email'
            AND p.section = 'chat'
            AND p.action = 'manage'
        )
    );

-- Politika pro čtení - všichni přihlášení uživatelé mohou číst
CREATE POLICY "Authenticated users can read chat users"
    ON chat_users
    FOR SELECT
    TO authenticated
    USING (true);

-- Politika pro správu - pouze uživatelé s oprávněním manage
CREATE POLICY "Admins can manage chat users"
    ON chat_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN user_permissions up ON ur.id = up.role_id
            JOIN permissions p ON up.permission_id = p.id
            WHERE ur.email = auth.jwt()->>'email'
            AND p.section = 'chat'
            AND p.action = 'manage'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM user_roles ur
            JOIN user_permissions up ON ur.id = up.role_id
            JOIN permissions p ON up.permission_id = p.id
            WHERE ur.email = auth.jwt()->>'email'
            AND p.section = 'chat'
            AND p.action = 'manage'
        )
    );

-- Přidání nového oprávnění do permissions
INSERT INTO permissions (id, section, action, description)
VALUES
    (uuid_generate_v4(), 'chat', 'view', 'Zobrazení chatu'),
    (uuid_generate_v4(), 'chat', 'manage', 'Správa chatu a archivů')
ON CONFLICT (section, action) DO NOTHING;

-- Znovu vložení existujících uživatelů chatu
INSERT INTO chat_users (email, name)
VALUES
    ('iimichal.svoboda@gmail.com', 'Michal Svoboda'),
    ('admin@rjwebdesign.cz', 'RJ Admin')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;