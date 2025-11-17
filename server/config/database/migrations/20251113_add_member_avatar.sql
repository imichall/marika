-- Přidání avatar pole pro členy členské sekce

ALTER TABLE member_users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN member_users.avatar_url IS 'URL avataru člena (cesta v Supabase Storage)';

