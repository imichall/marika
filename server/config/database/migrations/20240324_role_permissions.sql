-- Funkce pro získání oprávnění role
create or replace function get_role_permissions(p_role user_role_type)
returns table (
  section varchar(50),
  action permission_action_type
)
security definer
set search_path = auth, public
language plpgsql
as $$
begin
  -- Kontrola, zda je uživatel admin
  if not exists (
    select 1 from public.user_roles ur
    where ur.email = auth.jwt() ->> 'email'
    and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Pro adminy vrátíme všechna oprávnění
  if p_role = 'admin' then
    return query
      select p.section, p.action
      from permissions p;
  else
    -- Pro ostatní role vrátíme jejich specifická oprávnění
    return query
      select p.section, p.action
      from permissions p
      join user_permissions up on p.id = up.permission_id
      join user_roles ur on ur.id = up.role_id
      where ur.email = concat('default.', p_role, '@system.local');
  end if;
end;
$$;

-- Funkce pro nastavení oprávnění role
create or replace function set_role_permissions(
  p_role user_role_type,
  p_permissions json
)
returns boolean
security definer
set search_path = auth, public
language plpgsql
as $$
declare
  v_role_id uuid;
  v_permission record;
begin
  -- Kontrola, zda je uživatel admin
  if not exists (
    select 1 from public.user_roles ur
    where ur.email = auth.jwt() ->> 'email'
    and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Pro adminy nelze měnit oprávnění
  if p_role = 'admin' then
    return true;
  end if;

  -- Získáme nebo vytvoříme výchozí roli
  insert into user_roles (email, role)
  values (concat('default.', p_role, '@system.local'), p_role)
  on conflict (email) do update set role = p_role
  returning id into v_role_id;

  -- Smažeme existující oprávnění
  delete from user_permissions
  where role_id = v_role_id;

  -- Vložíme nová oprávnění
  for v_permission in
    select *
    from json_to_recordset(p_permissions)
    as x(section varchar(50), action permission_action_type)
  loop
    insert into user_permissions (role_id, permission_id)
    select v_role_id, p.id
    from permissions p
    where p.section = v_permission.section
    and p.action = v_permission.action;
  end loop;

  -- Aktualizujeme oprávnění pro všechny uživatele s touto rolí
  for v_role_id in
    select id from user_roles where role = p_role and email != concat('default.', p_role, '@system.local')
  loop
    -- Smažeme existující oprávnění
    delete from user_permissions where role_id = v_role_id;

    -- Zkopírujeme oprávnění z výchozí role
    insert into user_permissions (role_id, permission_id)
    select v_role_id, permission_id
    from user_permissions
    where role_id = (
      select id from user_roles
      where email = concat('default.', p_role, '@system.local')
    );
  end loop;

  return true;
end;
$$;