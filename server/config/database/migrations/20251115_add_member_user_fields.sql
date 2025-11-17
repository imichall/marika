-- Přidání chybějících polí do tabulky member_users pro import dat ze starého systému
-- Původní data obsahovala: Jmeno, E-mail, Telefon, Cela Adresa, Ulice, Mesto, PSC, Datum narozeni, Mesto narozeni

-- Nejprve zkontrolujeme, která pole už existují a která chybí
DO $$
BEGIN
  -- Přidáme pole "street" (Ulice) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'street'
  ) THEN
    ALTER TABLE member_users ADD COLUMN street TEXT;
    RAISE NOTICE 'Přidán sloupec: street';
  ELSE
    RAISE NOTICE 'Sloupec street již existuje';
  END IF;

  -- Přidáme pole "city" (Mesto) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'city'
  ) THEN
    ALTER TABLE member_users ADD COLUMN city TEXT;
    RAISE NOTICE 'Přidán sloupec: city';
  ELSE
    RAISE NOTICE 'Sloupec city již existuje';
  END IF;

  -- Přidáme pole "postal_code" (PSC) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE member_users ADD COLUMN postal_code TEXT;
    RAISE NOTICE 'Přidán sloupec: postal_code';
  ELSE
    RAISE NOTICE 'Sloupec postal_code již existuje';
  END IF;

  -- Přidáme pole "full_address" (Cela Adresa) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'full_address'
  ) THEN
    ALTER TABLE member_users ADD COLUMN full_address TEXT;
    RAISE NOTICE 'Přidán sloupec: full_address';
  ELSE
    RAISE NOTICE 'Sloupec full_address již existuje';
  END IF;

  -- Přidáme pole "birth_date" (Datum narozeni) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE member_users ADD COLUMN birth_date DATE;
    RAISE NOTICE 'Přidán sloupec: birth_date';
  ELSE
    RAISE NOTICE 'Sloupec birth_date již existuje';
  END IF;

  -- Přidáme pole "birth_place" (Mesto narozeni) pokud neexistuje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'member_users'
    AND column_name = 'birth_place'
  ) THEN
    ALTER TABLE member_users ADD COLUMN birth_place TEXT;
    RAISE NOTICE 'Přidán sloupec: birth_place';
  ELSE
    RAISE NOTICE 'Sloupec birth_place již existuje';
  END IF;

  RAISE NOTICE 'Kontrola a přidání polí dokončeno!';
END $$;

-- Zobrazíme aktuální strukturu tabulky member_users
SELECT
  column_name AS "Název sloupce",
  data_type AS "Datový typ",
  is_nullable AS "Nullable",
  column_default AS "Výchozí hodnota"
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'member_users'
ORDER BY ordinal_position;

