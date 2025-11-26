-- Přidání podpory pro SVG obrázky v bucketu member-avatars

-- Aktualizace allowed_mime_types pro member-avatars bucket
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
WHERE id = 'member-avatars';

