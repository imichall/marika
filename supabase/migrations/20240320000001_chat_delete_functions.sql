-- Funkce pro smazání všech zpráv z admin chatu
CREATE OR REPLACE FUNCTION delete_all_chat_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kontrola oprávnění
  IF NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN user_permissions up ON ur.id = up.role_id
    JOIN permissions p ON up.permission_id = p.id
    WHERE ur.email = auth.jwt()->>'email'
    AND p.section = 'chat'
    AND p.action = 'manage'
  ) THEN
    RAISE EXCEPTION 'Nedostatečná oprávnění';
  END IF;

  -- Smazání všech zpráv s WHERE podmínkou
  DELETE FROM admin_chat_messages
  WHERE created_at <= now();
END;
$$;

-- Funkce pro smazání všech záznamů o posledním přečtení
CREATE OR REPLACE FUNCTION delete_all_chat_last_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Kontrola oprávnění
  IF NOT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN user_permissions up ON ur.id = up.role_id
    JOIN permissions p ON up.permission_id = p.id
    WHERE ur.email = auth.jwt()->>'email'
    AND p.section = 'chat'
    AND p.action = 'manage'
  ) THEN
    RAISE EXCEPTION 'Nedostatečná oprávnění';
  END IF;

  -- Smazání všech záznamů o posledním přečtení s WHERE podmínkou
  DELETE FROM admin_chat_last_read
  WHERE created_at <= now();
END;
$$;

-- Přidání komentářů k funkcím
COMMENT ON FUNCTION delete_all_chat_messages IS 'Smaže všechny zprávy z admin chatu';
COMMENT ON FUNCTION delete_all_chat_last_read IS 'Smaže všechny záznamy o posledním přečtení zpráv';