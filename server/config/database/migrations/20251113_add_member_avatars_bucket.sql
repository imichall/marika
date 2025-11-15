-- Vytvoření veřejného bucketu pro avatary členů členské sekce

-- Vytvoření bucketu (veřejný pro snadný přístup k avatarům)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-avatars',
  'member-avatars',
  TRUE,  -- veřejný bucket
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      name = EXCLUDED.name;

-- RLS politiky pro nahrávání a mazání avatarů
DROP POLICY IF EXISTS "Member avatars public read" ON storage.objects;
DROP POLICY IF EXISTS "Member avatars upload" ON storage.objects;
DROP POLICY IF EXISTS "Member avatars delete" ON storage.objects;

-- Každý může číst avatary (bucket je veřejný)
CREATE POLICY "Member avatars public read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'member-avatars');

-- Pouze adminové a editoři mohou nahrávat avatary
CREATE POLICY "Member avatars upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'member-avatars' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role IN ('admin', 'editor')
      )
    )
  );

-- Pouze adminové a editoři mohou mazat avatary
CREATE POLICY "Member avatars delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'member-avatars' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role IN ('admin', 'editor')
      )
    )
  );

-- Politika pro update (přepsání souboru)
CREATE POLICY "Member avatars update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'member-avatars' AND (
      EXISTS (
        SELECT 1
        FROM user_roles ur
        WHERE ur.email = auth.jwt() ->> 'email'
          AND ur.role IN ('admin', 'editor')
      )
    )
  );

