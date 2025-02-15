-- Přidání sloupce is_voluntary do tabulky concerts
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS is_voluntary BOOLEAN DEFAULT FALSE;

-- Přidání komentáře ke sloupci
COMMENT ON COLUMN concerts.is_voluntary IS 'Označuje, zda je vstupné dobrovolné';

-- Aktualizace existujících záznamů
UPDATE concerts SET is_voluntary = FALSE WHERE is_voluntary IS NULL;