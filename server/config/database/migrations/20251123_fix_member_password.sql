-- Zkontrolovat a vytvořit řádek v settings pokud neexistuje
INSERT INTO settings (id, title, contact_email)
SELECT
  gen_random_uuid(),
  'Marika',
  'info@marika.cz'
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);

-- Upravená funkce pro nastavení společného hesla
CREATE OR REPLACE FUNCTION set_member_common_password(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
  v_count INTEGER;
BEGIN
  -- Zahashuj heslo
  v_password_hash := crypt(p_password, gen_salt('bf'));

  -- Zkontroluj, jestli existuje řádek v settings
  SELECT COUNT(*) INTO v_count FROM settings;

  IF v_count = 0 THEN
    -- Pokud neexistuje, vytvoř ho
    INSERT INTO settings (member_common_password_hash, updated_at)
    VALUES (v_password_hash, now());
  ELSE
    -- Pokud existuje, updatuj
    UPDATE settings
    SET member_common_password_hash = v_password_hash,
        updated_at = now();
  END IF;

  RETURN TRUE;
END;
$$;

-- Nastavit default heslo
DO $$
BEGIN
  -- Zajistit, že existuje řádek v settings
  IF NOT EXISTS (SELECT 1 FROM settings LIMIT 1) THEN
    INSERT INTO settings (member_common_password_hash, updated_at)
    VALUES (crypt('marika2024', gen_salt('bf')), now());
  ELSE
    -- Nastavit heslo pokud ještě není nastavené
    UPDATE settings
    SET member_common_password_hash = crypt('marika2024', gen_salt('bf'))
    WHERE member_common_password_hash IS NULL;
  END IF;
END $$;

