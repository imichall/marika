-- Přidání sloupců character a youtube_link do repertoire_items

DO $$
BEGIN
    -- Přidání sloupce character (charakter/postava)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repertoire_items' AND column_name = 'character') THEN
        ALTER TABLE public.repertoire_items ADD COLUMN character TEXT;
        RAISE NOTICE 'Column "character" added to "repertoire_items" table.';
    ELSE
        RAISE NOTICE 'Column "character" already exists in "repertoire_items" table.';
    END IF;

    -- Přidání sloupce youtube_link (odkaz na YouTube ukázku)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repertoire_items' AND column_name = 'youtube_link') THEN
        ALTER TABLE public.repertoire_items ADD COLUMN youtube_link TEXT;
        RAISE NOTICE 'Column "youtube_link" added to "repertoire_items" table.';
    ELSE
        RAISE NOTICE 'Column "youtube_link" already exists in "repertoire_items" table.';
    END IF;
END $$;

-- Zobrazení struktury tabulky pro ověření
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'repertoire_items' AND table_schema = 'public'
ORDER BY ordinal_position;

