-- Aktualizace RLS policies pro member-resources
-- Upravuje jak tabulku member_resources, tak storage bucket
-- Stejně jako u repertoire bucketu a tabulek,
-- kontrola oprávnění probíhá na úrovni aplikace (composables, middleware)
-- Důvod: Uživatelé v členské sekci se mohou přihlašovat přes "oddíly" (departments),
-- které nemají záznam v user_roles tabulce, ale mají oprávnění uložená v localStorage

-- =================================================================
-- ČÁST 1: Aktualizace politik pro TABULKU member_resources
-- =================================================================

-- Odstranění starých politik pro tabulku
DROP POLICY IF EXISTS "Member resources view" ON member_resources;
DROP POLICY IF EXISTS "Member resources manage" ON member_resources;
DROP POLICY IF EXISTS "Member resources insert" ON member_resources;
DROP POLICY IF EXISTS "Member resources update" ON member_resources;
DROP POLICY IF EXISTS "Member resources delete" ON member_resources;

-- SELECT - povolíme všem autentizovaným uživatelům
CREATE POLICY "Member resources view"
  ON member_resources
  FOR SELECT
  USING (auth.jwt() IS NOT NULL);

-- INSERT - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources insert"
  ON member_resources
  FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

-- UPDATE - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources update"
  ON member_resources
  FOR UPDATE
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

-- DELETE - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources delete"
  ON member_resources
  FOR DELETE
  USING (auth.jwt() IS NOT NULL);

-- =================================================================
-- ČÁST 2: Aktualizace politik pro STORAGE BUCKET member-resources
-- =================================================================

-- Odstranění starých politik pro storage
DROP POLICY IF EXISTS "Member resources view policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources manage policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Member resources update policy" ON storage.objects;

-- SELECT - povolíme všem autentizovaným uživatelům
CREATE POLICY "Member resources view policy"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'member-resources' AND auth.jwt() IS NOT NULL);

-- INSERT - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources manage policy"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'member-resources' AND auth.jwt() IS NOT NULL);

-- UPDATE - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources update policy"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'member-resources' AND auth.jwt() IS NOT NULL)
  WITH CHECK (bucket_id = 'member-resources' AND auth.jwt() IS NOT NULL);

-- DELETE - povolíme všem autentizovaným uživatelům (kontrola oprávnění v aplikaci)
CREATE POLICY "Member resources delete policy"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'member-resources' AND auth.jwt() IS NOT NULL);

-- =================================================================
-- OVĚŘENÍ POLITIK
-- =================================================================

-- Ověření politik pro tabulku member_resources
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'member_resources'
ORDER BY policyname;

-- Ověření politik pro storage bucket
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'Member resources%'
ORDER BY policyname;

