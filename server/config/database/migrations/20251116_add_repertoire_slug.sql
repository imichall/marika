-- Přidání sloupce slug do repertoire_items

DO $$
BEGIN
    -- Přidání sloupce slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'repertoire_items' AND column_name = 'slug') THEN
        ALTER TABLE public.repertoire_items ADD COLUMN slug VARCHAR(500);
        RAISE NOTICE 'Column "slug" added to "repertoire_items" table.';

        -- Vytvoření indexu pro slug
        CREATE INDEX IF NOT EXISTS idx_repertoire_items_slug ON public.repertoire_items(slug);
        RAISE NOTICE 'Index "idx_repertoire_items_slug" created.';
    ELSE
        RAISE NOTICE 'Column "slug" already exists in "repertoire_items" table.';
    END IF;
END $$;

-- Zobrazení struktury tabulky pro ověření
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'repertoire_items' AND table_schema = 'public'
ORDER BY ordinal_position;

