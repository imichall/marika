-- Přidání sloupce detailed_description do tabulky concerts
ALTER TABLE concerts ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Přidání komentáře ke sloupci
COMMENT ON COLUMN concerts.detailed_description IS 'Detailní popis koncertu';

-- Zkopírování existujícího popisu do detailního popisu pro zachování dat
UPDATE concerts SET detailed_description = description WHERE detailed_description IS NULL;