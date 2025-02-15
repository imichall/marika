-- Funkce pro smazání role uživatele
create or replace function delete_user_role(p_email varchar)
returns void
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

  -- Smazání oprávnění uživatele
  delete from user_permissions
  where role_id in (
    select id from user_roles
    where email = p_email
  );

  -- Smazání role uživatele
  delete from user_roles
  where email = p_email;
end;
$$;

-- Funkce pro smazání uživatele z auth
create or replace function delete_user(p_email varchar)
returns void
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

  -- Smazání uživatele z auth.users
  delete from auth.users
  where email = p_email;
end;
$$;