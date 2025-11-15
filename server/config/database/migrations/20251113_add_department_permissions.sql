-- Přidání sloupce pro oprávnění oddílů
ALTER TABLE member_departments
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
  "repertoire_view": true,
  "repertoire_edit": false,
  "member_directory_view": true,
  "members_area_view": true,
  "member_resources_view": true,
  "member_resources_upload": false
}'::jsonb;

-- Nastavení výchozích oprávnění pro existující oddíly
UPDATE member_departments
SET permissions = '{
  "repertoire_view": true,
  "repertoire_edit": false,
  "member_directory_view": true,
  "members_area_view": true,
  "member_resources_view": true,
  "member_resources_upload": false
}'::jsonb
WHERE permissions IS NULL;

-- Kommentář k vysvětlení struktury
COMMENT ON COLUMN member_departments.permissions IS 'JSON objekt s oprávněními oddílu v členské sekci. Klíče: repertoire_view, repertoire_edit, member_directory_view, members_area_view, member_resources_view, member_resources_upload';

