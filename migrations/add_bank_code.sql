-- Přidáme sloupec bank_code
ALTER TABLE "public"."concerts" ADD COLUMN IF NOT EXISTS "bank_code" varchar(4);

-- Nastavíme výchozí hodnotu pro existující záznamy (0100 = Komerční banka)
UPDATE "public"."concerts" SET "bank_code" = '0100' WHERE "bank_code" IS NULL;

-- Upravíme account_number - odstraníme z něj kód banky, pokud tam je
UPDATE "public"."concerts"
SET "account_number" = regexp_replace(account_number, '/[0-9]{4}$', '')
WHERE account_number LIKE '%/%';

-- Přidáme komentáře ke sloupcům
COMMENT ON COLUMN "public"."concerts"."bank_code" IS 'Bank code (e.g. 0100 for KB, 0300 for ČSOB)';
COMMENT ON COLUMN "public"."concerts"."account_number" IS 'Account number without bank code (max 16 digits)';

-- Upravíme RLS policy pro čtení - všichni mohou číst
DROP POLICY IF EXISTS "Concerts are viewable by everyone" ON "public"."concerts";
CREATE POLICY "Concerts are viewable by everyone" ON "public"."concerts"
FOR SELECT
USING (true);

-- Upravíme RLS policy pro úpravy - pouze autentizovaní uživatelé s rolí admin
DROP POLICY IF EXISTS "Concerts are editable by admins" ON "public"."concerts";
CREATE POLICY "Concerts are editable by admins" ON "public"."concerts"
FOR ALL
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'isAdmin' = 'true'
  )
);