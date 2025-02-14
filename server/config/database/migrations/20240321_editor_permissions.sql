-- Nejprve odstraníme starou verzi funkce
drop function if exists setup_editor_permissions();

-- Funkce pro přidání oprávnění editorovi
create or replace function setup_editor_permissions()
returns table (
  role_id uuid,
  permissions_added int
)
language plpgsql
as $$
declare
  v_role_id uuid;
  v_count int;
begin
  -- Pro každou roli editor
  for v_role_id in
    select id from user_roles where role = 'editor'
  loop
    -- Přidáme základní oprávnění pro editora
    with inserted as (
      insert into user_permissions (role_id, permission_id)
      select v_role_id, p.id
      from permissions p
      where
        -- Koncerty - plný přístup
        (p.section = 'concerts' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Galerie - plný přístup
        or (p.section = 'gallery' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Reference - plný přístup
        or (p.section = 'testimonials' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Objednávky - rozšířená oprávnění
        or (p.section = 'orders' and p.action in ('view', 'edit', 'complete', 'cancel'))
        -- Skupiny - plný přístup
        or (p.section = 'choir_groups' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Kontakty - plný přístup
        or (p.section = 'contacts' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Sociální sítě - zobrazení a úpravy
        or (p.section = 'social_media' and p.action in ('view', 'edit'))
        -- Nastavení - pouze základní
        or (p.section = 'settings' and p.action in ('view', 'edit'))
      on conflict on constraint user_permissions_role_id_permission_id_key do nothing
      returning 1
    )
    select count(*) into v_count from inserted;

    return query select v_role_id, v_count;
  end loop;

  -- Pokud neexistují žádní editoři, vrátíme null hodnoty
  if not found then
    return query select null::uuid, 0;
  end if;
end;
$$;

-- Spustíme funkci pro nastavení oprávnění
select * from setup_editor_permissions();

-- Vypíšeme aktuální oprávnění pro editory
select
  ur.email,
  ur.role,
  p.section,
  p.action,
  p.description
from user_roles ur
join user_permissions up on ur.id = up.role_id
join permissions p on p.id = up.permission_id
where ur.role = 'editor'
order by ur.email, p.section, p.action;