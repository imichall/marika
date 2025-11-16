-- Vygenerování slug pro existující záznamy repertoáru
-- Použijeme funkci pro slugifikaci názvu

DO $$
DECLARE
    rec RECORD;
    new_slug TEXT;
    base_slug TEXT;
    counter INTEGER;
BEGIN
    -- Projdeme všechny záznamy bez slug nebo s prázdným slug
    FOR rec IN
        SELECT id, title, slug
        FROM repertoire_items
        WHERE slug IS NULL OR slug = ''
        ORDER BY created_at
    LOOP
        -- Základní slug z názvu (malá písmena, odstranění diakritiky, mezery nahrazeny pomlčkami)
        base_slug := lower(trim(rec.title));
        -- Odstranění diakritiky
        base_slug := translate(
            base_slug,
            'áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ',
            'acdeeinorstuuyzacdeeinorstuuyz'
        );
        -- Nahrazení mezer a speciálních znaků pomlčkami
        base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
        -- Odstranění pomlček na začátku a konci
        base_slug := trim(both '-' from base_slug);
        -- Omezení délky
        base_slug := substring(base_slug from 1 for 200);

        -- Pokud je slug prázdný, použijeme ID
        IF base_slug = '' THEN
            base_slug := rec.id::text;
        END IF;

        new_slug := base_slug;
        counter := 0;

        -- Zkontrolujeme, zda slug už neexistuje
        WHILE EXISTS (
            SELECT 1
            FROM repertoire_items
            WHERE slug = new_slug
            AND id != rec.id
        ) LOOP
            counter := counter + 1;
            -- Přidáme číslo na konec
            new_slug := base_slug || '-' || counter::text;
            -- Omezení délky
            IF length(new_slug) > 200 THEN
                new_slug := substring(base_slug from 1 for (200 - length(counter::text) - 1)) || '-' || counter::text;
            END IF;
        END LOOP;

        -- Aktualizujeme slug
        UPDATE repertoire_items
        SET slug = new_slug
        WHERE id = rec.id;

        RAISE NOTICE 'Vygenerován slug "%" pro repertoár "%" (ID: %)', new_slug, rec.title, rec.id;
    END LOOP;

    RAISE NOTICE 'Vygenerování slug dokončeno!';
END $$;

-- Zobrazení výsledků
SELECT
    id,
    title,
    slug,
    created_at
FROM repertoire_items
ORDER BY created_at
LIMIT 20;

