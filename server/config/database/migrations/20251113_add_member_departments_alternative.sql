-- Alternativní verze s SHA256 hashováním (pokud bcrypt nefunguje)
-- Toto je záložní řešení

-- POVOLENÍ PGCRYPTO EXTENSION
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Funkce pro hashování pomocí SHA256 (jednodušší než bcrypt)
CREATE OR REPLACE FUNCTION hash_department_password_sha256(p_password TEXT)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT encode(digest(p_password, 'sha256'), 'hex');
$$;

-- Test funkce
SELECT hash_department_password_sha256('test123');

-- Pokud toto funguje, můžeme použít SHA256 místo bcrypt

