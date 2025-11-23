-- Přidání společného hesla pro členskou sekci do settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS member_common_password_hash TEXT;

-- Funkce pro nastavení společného hesla
CREATE OR REPLACE FUNCTION set_member_common_password(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Zahashuj heslo
  v_password_hash := crypt(p_password, gen_salt('bf'));

  -- Updatuj settings (předpokládáme, že existuje jen jeden řádek)
  UPDATE settings
  SET member_common_password_hash = v_password_hash,
      updated_at = now();

  RETURN TRUE;
END;
$$;

-- Funkce pro ověření společného hesla
CREATE OR REPLACE FUNCTION verify_member_common_password(p_password TEXT)
RETURNS TABLE (
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Získej hash hesla ze settings
  SELECT member_common_password_hash INTO v_password_hash
  FROM settings
  LIMIT 1;

  -- Pokud heslo není nastaveno, vrať false
  IF v_password_hash IS NULL THEN
    RETURN QUERY SELECT FALSE;
    RETURN;
  END IF;

  -- Ověř heslo
  RETURN QUERY SELECT (v_password_hash = crypt(p_password, v_password_hash));
END;
$$;

-- Nastavit default heslo (heslo: "marika2024" - později změnit!)
-- Administrátor by měl po nasazení změnit heslo
UPDATE settings
SET member_common_password_hash = crypt('marika2024', gen_salt('bf'))
WHERE member_common_password_hash IS NULL;

