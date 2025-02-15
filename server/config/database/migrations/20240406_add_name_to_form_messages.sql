-- Přidání sloupce name do tabulky form_messages
ALTER TABLE form_messages ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Aktualizace existujících záznamů - nastavení jména podle emailu
UPDATE form_messages SET name = email WHERE name IS NULL;

-- Nastavení sloupce jako NOT NULL
ALTER TABLE form_messages ALTER COLUMN name SET NOT NULL;