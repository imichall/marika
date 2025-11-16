-- Aktualizace RLS politik pro repertoire_items a repertoire_files
-- Podobně jako u member_directory - kontrola oprávnění na úrovni aplikace

-- Odstranění starých politik
DROP POLICY IF EXISTS "Repertoire items view" ON public.repertoire_items;
DROP POLICY IF EXISTS "Repertoire items manage" ON public.repertoire_items;
DROP POLICY IF EXISTS "Repertoire items delete" ON public.repertoire_items;
DROP POLICY IF EXISTS "Repertoire files view" ON public.repertoire_files;
DROP POLICY IF EXISTS "Repertoire files manage" ON public.repertoire_files;
DROP POLICY IF EXISTS "Repertoire files delete" ON public.repertoire_files;

-- NOVÉ POLITIKY PRO REPERTOÁR ITEMS
-- SELECT - povolíme všem (kontrola oprávnění na úrovni aplikace)
CREATE POLICY "Repertoire items view"
  ON public.repertoire_items
  FOR SELECT
  TO public
  USING (true);

-- INSERT/UPDATE - povolíme všem (kontrola oprávnění na úrovni aplikace)
-- Aplikace ověřuje oprávnění přes composable a middleware
CREATE POLICY "Repertoire items manage"
  ON public.repertoire_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- DELETE - povolíme všem (kontrola oprávnění na úrovni aplikace)
CREATE POLICY "Repertoire items delete"
  ON public.repertoire_items
  FOR DELETE
  TO public
  USING (true);

-- NOVÉ POLITIKY PRO REPERTOÁR FILES
-- SELECT - povolíme všem
CREATE POLICY "Repertoire files view"
  ON public.repertoire_files
  FOR SELECT
  TO public
  USING (true);

-- INSERT/UPDATE - povolíme všem
CREATE POLICY "Repertoire files manage"
  ON public.repertoire_files
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- DELETE - povolíme všem
CREATE POLICY "Repertoire files delete"
  ON public.repertoire_files
  FOR DELETE
  TO public
  USING (true);

-- Ověření politik
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('repertoire_items', 'repertoire_files')
ORDER BY tablename, policyname;

