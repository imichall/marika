-- Migrace pro SMTP nastavení
-- Přidání sloupce smtp_settings do tabulky settings

-- Nejprve zkontrolujeme, zda sloupec již neexistuje
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'settings' AND column_name = 'smtp_settings'
    ) THEN
        ALTER TABLE settings ADD COLUMN smtp_settings JSONB DEFAULT '{
            "host": "smtp.websupport.cz",
            "port": 465,
            "secure": true,
            "user": "",
            "password": "",
            "from_email": "",
            "from_name": "Marika Singers"
        }'::jsonb;
    END IF;
END
$$;

-- Aktualizace výchozích hodnot pokud je sloupec prázdný
UPDATE settings
SET smtp_settings = '{
    "host": "smtp.websupport.cz",
    "port": 465,
    "secure": true,
    "user": "",
    "password": "",
    "from_email": "",
    "from_name": "Marika Singers"
}'::jsonb
WHERE smtp_settings IS NULL OR smtp_settings = '{}'::jsonb;

