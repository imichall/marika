-- Přidání práv pro správu členů do oddílových permissions
-- Tyto práva umožní oddílům přidávat, upravovat a mazat členy v sekci clenska-sekce/clenove

-- Přidání nových práv do existujících oddílů (pokud ještě neexistují)
UPDATE member_departments
SET permissions = jsonb_set(
  COALESCE(permissions, '{}'::jsonb),
  '{member_management_create}',
  'false'::jsonb
)
WHERE permissions->>'member_management_create' IS NULL;

UPDATE member_departments
SET permissions = jsonb_set(
  permissions,
  '{member_management_edit}',
  'false'::jsonb
)
WHERE permissions->>'member_management_edit' IS NULL;

UPDATE member_departments
SET permissions = jsonb_set(
  permissions,
  '{member_management_delete}',
  'false'::jsonb
)
WHERE permissions->>'member_management_delete' IS NULL;

-- Aktualizace komentáře
COMMENT ON COLUMN member_departments.permissions IS 'JSON objekt s oprávněními oddílu v členské sekci. Klíče: repertoire_view, repertoire_edit, member_directory_view, members_area_view, member_resources_view, member_resources_upload, member_management_create, member_management_edit, member_management_delete';

