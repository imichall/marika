-- Nejprve upravíme všechny politiky, které závisí na admin_users

-- ticket_orders politiky
drop policy if exists "Admins can view all orders" on ticket_orders;
drop policy if exists "Admins can update orders" on ticket_orders;
create policy "Admins can view all orders" on ticket_orders
  for select using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );
create policy "Admins can update orders" on ticket_orders
  for update using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- storage.objects politiky
drop policy if exists "Gallery images are editable by admins" on storage.objects;
create policy "Gallery images are editable by admins" on storage.objects
  for all using (
    exists (
      select 1 from public.user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- gallery politiky
drop policy if exists "Gallery is editable by admins" on gallery;
create policy "Gallery is editable by admins" on gallery
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- choir_groups politiky
drop policy if exists "Upravovat skupiny mohou pouze admin uživatelé" on choir_groups;
create policy "Upravovat skupiny mohou pouze admin uživatelé" on choir_groups
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- bank_accounts politiky
drop policy if exists "Upravovat bankovní účty mohou pouze admin uživatelé" on bank_accounts;
create policy "Upravovat bankovní účty mohou pouze admin uživatelé" on bank_accounts
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- contacts politiky
drop policy if exists "Upravovat kontakty mohou pouze admin uživatelé" on contacts;
create policy "Upravovat kontakty mohou pouze admin uživatelé" on contacts
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- user_roles politiky a constraint
alter table user_roles drop constraint if exists fk_admin_users;
drop policy if exists "Admins can view all roles" on user_roles;
drop policy if exists "Only admins can insert roles" on user_roles;
drop policy if exists "Only admins can update roles" on user_roles;
drop policy if exists "Only admins can delete roles" on user_roles;

create policy "Admins can view all roles" on user_roles
  for select using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can insert roles" on user_roles
  for insert with check (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can update roles" on user_roles
  for update using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can delete roles" on user_roles
  for delete using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- permissions politiky
drop policy if exists "Only admins can modify permissions" on permissions;
create policy "Only admins can modify permissions" on permissions
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- user_permissions politiky
drop policy if exists "Admins can view all permissions" on user_permissions;
drop policy if exists "Only admins can modify user permissions" on user_permissions;

create policy "Admins can view all permissions" on user_permissions
  for select using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can modify user permissions" on user_permissions
  for all using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- Nyní můžeme bezpečně odstranit admin_users tabulku
drop table if exists public.admin_users cascade;