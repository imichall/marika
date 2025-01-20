-- Vytvoření tabulky pro skupiny
CREATE TABLE IF NOT EXISTS choir_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image TEXT,
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

CREATE TRIGGER update_choir_groups_updated_at
    BEFORE UPDATE ON choir_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Vložení výchozích dat
INSERT INTO choir_groups (name, description, image)
VALUES
    ('Marika Singers', 'Vokální seskupení, které můžete již více jak 15 let vídat na podiích jak u nás, tak v mnoha evropských zemích. Žánrová pestrost, vynikající přednes, skvělý hudební doprovod, efektní střídání sborových a sólových partů proložené vystoupením pánského i dámského kvinteta, ... to jsou vystoupení, která vás pohltí svojí energií, kde všichni zpívají a hrají jako o život a kde dirigenta více tančí, nežli diriguje. Kromě koncertních podií je lze slyšet i v pořadech České televize, Českého rozhlasu, TV Noe. Přijďte se přesvědčit a sdílejte tuto atmosféru společně s námi.', '/images/about-1.png'),
    ('Voices', 'Mužské vokální uskupení v doprovodu skvělých muzikantů.', '/images/about-2.png'),
    ('Five', 'Ženské vokální uskupení v doprovodu skvělých muzikantů.', '/images/about-3.png')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    image = EXCLUDED.image;

-- Přidání RLS
ALTER TABLE choir_groups ENABLE ROW LEVEL SECURITY;

-- Vytvoření policy pro čtení (může kdokoliv)
CREATE POLICY "Choir groups are viewable by everyone"
ON choir_groups FOR SELECT
TO PUBLIC
USING (true);

-- Vytvoření policy pro úpravy (pouze admin)
CREATE POLICY "Choir groups can be modified only by admin"
ON choir_groups FOR ALL
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');