-- Vytvoření tabulky pro kontakty
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    ico VARCHAR(20),
    dic VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vložení výchozích dat
INSERT INTO contacts (group_name, address, ico, dic, email)
VALUES
    ('Marika Singers, z.s.', 'Pod Labuťkou 967\n180 00 Praha 8', '27069699', NULL, NULL),
    ('VOICES', 'Institut F1, Praha 8', '27069699', '27069699', 'info@voices.cz'),
    ('FIVE', 'Institut F1, Praha 8', '27069699', '27069699', NULL)
ON CONFLICT (group_name) DO UPDATE SET
    address = EXCLUDED.address,
    ico = EXCLUDED.ico,
    dic = EXCLUDED.dic,
    email = EXCLUDED.email;

-- Přidání RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Vytvoření policy pro čtení (může kdokoliv)
CREATE POLICY "Contacts are viewable by everyone"
ON contacts FOR SELECT
TO PUBLIC
USING (true);

-- Vytvoření policy pro úpravy (pouze admin)
CREATE POLICY "Contacts can be modified only by admin"
ON contacts FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');