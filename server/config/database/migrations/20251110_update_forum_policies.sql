-- Rozšíření RLS politik pro fórum tak, aby editoři mohli upravovat a mazat
-- témata i odpovědi stejně jako administrátoři.

-- Fórum – témata: UPDATE
DROP POLICY IF EXISTS "Forum topics are editable by author or admin" ON forum_topics;
CREATE POLICY "Forum topics are editable by author or admin"
  ON forum_topics FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = author_email OR
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role IN ('admin', 'editor')
      )
    )
  );

-- Fórum – témata: DELETE
DROP POLICY IF EXISTS "Forum topics are deletable by admin" ON forum_topics;
CREATE POLICY "Forum topics are deletable by admin"
  ON forum_topics FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

-- Fórum – odpovědi: UPDATE
DROP POLICY IF EXISTS "Forum replies are editable by author or admin" ON forum_replies;
CREATE POLICY "Forum replies are editable by author or admin"
  ON forum_replies FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND (
      auth.jwt() ->> 'email' = author_email OR
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role IN ('admin', 'editor')
      )
    )
  );

-- Fórum – odpovědi: DELETE
DROP POLICY IF EXISTS "Forum replies are deletable by author or admin" ON forum_replies;
CREATE POLICY "Forum replies are deletable by author or admin"
  ON forum_replies FOR DELETE
  USING (
    auth.jwt() ->> 'email' = author_email OR
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

