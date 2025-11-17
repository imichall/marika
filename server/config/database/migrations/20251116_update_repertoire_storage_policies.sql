-- Aktualizace storage policies pro repertoire bucket
-- Stejně jako u repertoire_items a repertoire_files tabulek,
-- kontrola oprávnění probíhá na úrovni aplikace (composables, middleware)

-- Odstranění starých politik
DROP POLICY IF EXISTS "Repertoire files view policy" ON storage.objects;
DROP POLICY IF EXISTS "Repertoire files manage policy" ON storage.objects;
DROP POLICY IF EXISTS "Repertoire files delete policy" ON storage.objects;

-- NOVÉ POLITIKY PRO REPERTOIRE STORAGE BUCKET
-- SELECT - povolíme všem (bucket je privátní, ale kontrola oprávnění na úrovni aplikace)
CREATE POLICY "Repertoire files view policy"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'repertoire');

-- INSERT - povolíme všem (kontrola oprávnění na úrovni aplikace)
-- Aplikace ověřuje oprávnění přes composable (useRepertoire) a middleware
CREATE POLICY "Repertoire files manage policy"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'repertoire');

-- UPDATE - povolíme všem (kontrola oprávnění na úrovni aplikace)
CREATE POLICY "Repertoire files update policy"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'repertoire')
  WITH CHECK (bucket_id = 'repertoire');

-- DELETE - povolíme všem (kontrola oprávnění na úrovni aplikace)
CREATE POLICY "Repertoire files delete policy"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'repertoire');

-- Ověření politik
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'Repertoire%'
ORDER BY policyname;

