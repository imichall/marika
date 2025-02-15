-- Funkce pro manuální archivování koncertů
CREATE OR REPLACE FUNCTION archive_old_concerts()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archivujeme koncerty, které již proběhly
  UPDATE concerts
  SET is_archived = TRUE
  WHERE is_archived = FALSE
  AND (
    -- Koncert proběhl (datum je menší než dnešní)
    date < CURRENT_DATE
    OR
    -- Koncert proběhl dnes a čas je menší než aktuální
    (date = CURRENT_DATE AND time < CURRENT_TIME)
  );
END;
$$;

-- Funkce pro automatické archivování koncertů (trigger)
CREATE OR REPLACE FUNCTION auto_archive_concerts()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archivujeme koncerty, které již proběhly
  UPDATE concerts
  SET is_archived = TRUE
  WHERE is_archived = FALSE
  AND (
    -- Koncert proběhl (datum je menší než dnešní)
    date < CURRENT_DATE
    OR
    -- Koncert proběhl dnes a čas je menší než aktuální
    (date = CURRENT_DATE AND time < CURRENT_TIME)
  );

  RETURN NULL;
END;
$$;

-- Vytvoříme trigger, který se spustí při změně data nebo času
CREATE OR REPLACE TRIGGER trigger_auto_archive_concerts
  AFTER INSERT OR UPDATE OF date, time ON concerts
  FOR EACH STATEMENT
  EXECUTE FUNCTION auto_archive_concerts();

-- Spustíme archivaci pro existující koncerty pomocí manuální funkce
SELECT archive_old_concerts();