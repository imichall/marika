-- Drop existing objects
drop function if exists get_users();
drop function if exists update_user_role();
drop function if exists check_permission();
drop table if exists user_permissions cascade;
drop table if exists permissions cascade;
drop table if exists user_roles cascade;
drop type if exists user_role_type cascade;
drop type if exists permission_action_type cascade;

-- Create types
create type user_role_type as enum ('admin', 'editor', 'viewer');
create type permission_action_type as enum ('view', 'create', 'edit', 'delete', 'manage', 'complete', 'cancel');

-- Create roles table
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  role user_role_type not null default 'viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create permissions table
create table permissions (
  id uuid primary key default gen_random_uuid(),
  section varchar(50) not null,
  action permission_action_type not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(section, action)
);

-- Create user permissions table
create table user_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references user_roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(role_id, permission_id)
);

-- Create indexes
create index user_roles_email_idx on user_roles(email);
create index permissions_section_action_idx on permissions(section, action);
create index user_permissions_role_idx on user_permissions(role_id);

-- Enable Row Level Security
alter table user_roles enable row level security;
alter table permissions enable row level security;
alter table user_permissions enable row level security;

-- Policies for user_roles table
create policy "Public read access for user_roles"
  on user_roles for select
  using (true);

create policy "Only admins can insert roles"
  on user_roles for insert
  with check (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
    or
    not exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
    )
  );

create policy "Only admins can update roles"
  on user_roles for update
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can delete roles"
  on user_roles for delete
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- Policies for permissions table
create policy "Everyone can view permissions"
  on permissions for select
  using (true);

create policy "Only admins can modify permissions"
  on permissions for all
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- Policies for user_permissions table
create policy "Users can view their own permissions"
  on user_permissions for select
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and id = user_permissions.role_id
    )
  );

create policy "Admins can view all permissions"
  on user_permissions for select
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

create policy "Only admins can modify user permissions"
  on user_permissions for all
  using (
    exists (
      select 1 from user_roles
      where email = auth.jwt() ->> 'email'
      and role = 'admin'
    )
  );

-- Update trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_user_roles_updated_at
    before update on user_roles
    for each row
    execute function update_updated_at_column();

create trigger update_permissions_updated_at
    before update on permissions
    for each row
    execute function update_updated_at_column();

create trigger update_user_permissions_updated_at
    before update on user_permissions
    for each row
    execute function update_updated_at_column();

-- Create function to check if user has permission
create or replace function check_permission(
  p_email varchar(255),
  p_section varchar(50),
  p_action permission_action_type
)
returns boolean
security definer
set search_path = auth, public
language plpgsql
as $$
declare
  v_role user_role_type;
begin
  -- Získání role uživatele
  select role into v_role
  from user_roles
  where email = p_email;

  -- Admin má vždy všechna oprávnění
  if v_role = 'admin' then
    return true;
  end if;

  -- Pro ostatní role kontrolujeme specifická oprávnění
  return exists (
    select 1
    from user_roles ur
    join user_permissions up on ur.id = up.role_id
    join permissions p on p.id = up.permission_id
    where ur.email = p_email
    and p.section = p_section
    and p.action = p_action
  );
end;
$$;

-- Function to get users (only for admin)
create or replace function get_users()
returns table (
  id uuid,
  email varchar(255),
  created_at timestamptz,
  last_sign_in_at timestamptz,
  confirmed_at timestamptz,
  is_admin boolean,
  role user_role_type
)
security definer
set search_path = auth, public
language plpgsql
as $$
begin
  -- Check if the user is admin
  if not exists (
    select 1 from public.user_roles ur
    where ur.email = auth.jwt() ->> 'email'
    and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  return query
    select
      u.id,
      u.email::varchar(255),
      u.created_at,
      u.last_sign_in_at,
      u.confirmed_at,
      (ur.role = 'admin') as is_admin,
      coalesce(ur.role, 'viewer'::user_role_type) as role
    from auth.users u
    left join public.user_roles ur on ur.email = u.email
    order by u.created_at desc;
end;
$$;

-- Function to update user role
create or replace function update_user_role(
  p_email varchar(255),
  p_role user_role_type
)
returns boolean
security definer
set search_path = auth, public
language plpgsql
as $$
declare
  v_role_id uuid;
begin
  -- Check if the current user is admin
  if not exists (
    select 1 from public.user_roles ur
    where ur.email = auth.jwt() ->> 'email'
    and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Update or insert the role
  insert into public.user_roles (email, role)
  values (p_email, p_role)
  on conflict (email)
  do update set role = p_role
  returning id into v_role_id;

  -- Delete existing permissions for the user (after we have role id)
  delete from user_permissions
  where role_id = v_role_id;

  -- If setting admin role, grant all permissions
  if p_role = 'admin' then
    insert into user_permissions (role_id, permission_id)
    select v_role_id, p.id
    from permissions p
    on conflict (role_id, permission_id) do nothing;
  end if;

  -- If setting editor role, grant editor permissions
  if p_role = 'editor' then
    -- Try to copy permissions from default template role if it exists
    insert into user_permissions (role_id, permission_id)
    select v_role_id, permission_id
    from user_permissions up
    join user_roles ur on ur.id = up.role_id
    where ur.role = p_role
      and ur.email = format('default.%s@system.local', p_role)
    on conflict (role_id, permission_id) do nothing;

    -- If no template permissions were found, fall back to predefined defaults
    if not exists (
      select 1 from user_permissions up
      where up.role_id = v_role_id
    ) then
    insert into user_permissions (role_id, permission_id)
    select v_role_id, p.id
    from permissions p
    where
      -- Koncerty - plná správa
        (p.section = 'concerts' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Galerie - plná správa
        or (p.section = 'gallery' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Reference - plná správa
        or (p.section = 'testimonials' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Objednávky - rozšířená oprávnění
        or (p.section = 'orders' and p.action in ('view', 'edit', 'complete', 'cancel', 'delete'))
        -- Sociální sítě - základní správa
        or (p.section = 'social_media' and p.action in ('view', 'edit'))
        -- Kontakty - plná správa
        or (p.section = 'contacts' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Zprávy z formuláře - plná správa
        or (p.section = 'form_messages' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Audit - konfigurace i zobrazení
        or (p.section = 'audit' and p.action in ('view', 'manage'))
        -- Skupiny - plná správa
        or (p.section = 'choir_groups' and p.action in ('view', 'create', 'edit', 'delete'))
        -- Nastavení - základní správa
        or (p.section = 'settings' and p.action in ('view', 'edit'))
        -- Fórum - kompletní správa
        or (p.section = 'forum_view' and p.action = 'view')
        or (p.section = 'forum_create' and p.action = 'create')
        or (p.section = 'forum_delete' and p.action = 'delete')
        or (p.section = 'forum_categories' and p.action = 'manage')
        or (p.section = 'forum_tags' and p.action = 'manage')
        -- E-maily - historie i správa
        or (p.section = 'emails' and p.action in ('view', 'manage'))
        -- Členská sekce - repertoár, adresář a dokumenty
        or (p.section = 'repertoire' and p.action in ('view', 'create', 'edit'))
        or (p.section = 'member_directory' and p.action in ('view', 'create', 'edit', 'delete'))
        or (p.section = 'member_resources' and p.action in ('view', 'create', 'edit'))
        or (p.section = 'members_area' and p.action = 'view')
    on conflict (role_id, permission_id) do nothing;
    end if;
  elsif p_role = 'viewer' then
    -- Viewer role - copy template if available, otherwise fallback to defaults
    insert into user_permissions (role_id, permission_id)
    select v_role_id, permission_id
    from user_permissions up
    join user_roles ur on ur.id = up.role_id
    where ur.role = p_role
      and ur.email = format('default.%s@system.local', p_role)
    on conflict (role_id, permission_id) do nothing;

    if not exists (
      select 1 from user_permissions up
      where up.role_id = v_role_id
    ) then
      insert into user_permissions (role_id, permission_id)
      select v_role_id, p.id
      from permissions p
      where p.section in (
        'concerts',
        'gallery',
        'testimonials',
        'orders',
        'social_media',
        'contacts',
        'choir_groups',
        'settings',
        'form_messages',
        'audit',
        'repertoire',
        'member_directory',
        'member_resources',
        'members_area',
        'emails',
        'forum_view'
      )
      and p.action = 'view'
      on conflict (role_id, permission_id) do nothing;
    end if;
  end if;

  return true;
end;
$$;

-- Insert default permissions
insert into permissions (section, action, description) values
  ('concerts', 'view', 'Zobrazení koncertů'),
  ('concerts', 'create', 'Vytváření koncertů'),
  ('concerts', 'edit', 'Úprava koncertů'),
  ('concerts', 'delete', 'Mazání koncertů'),
  ('gallery', 'view', 'Zobrazení galerie'),
  ('gallery', 'create', 'Přidávání fotografií'),
  ('gallery', 'edit', 'Úprava fotografií'),
  ('gallery', 'delete', 'Mazání fotografií'),
  ('testimonials', 'view', 'Zobrazení referencí'),
  ('testimonials', 'create', 'Přidávání referencí'),
  ('testimonials', 'edit', 'Úprava referencí'),
  ('testimonials', 'delete', 'Mazání referencí'),
  ('orders', 'view', 'Zobrazení objednávek'),
  ('orders', 'edit', 'Správa objednávek'),
  ('orders', 'complete', 'Označení objednávky jako dokončené'),
  ('orders', 'cancel', 'Zrušení objednávky'),
  ('orders', 'delete', 'Mazání objednávek'),
  ('social_media', 'view', 'Zobrazení sociálních sítí'),
  ('social_media', 'edit', 'Správa sociálních sítí'),
  ('contacts', 'view', 'Zobrazení kontaktů'),
  ('contacts', 'create', 'Vytváření kontaktů'),
  ('contacts', 'edit', 'Úprava kontaktů'),
  ('contacts', 'delete', 'Mazání kontaktů'),
  ('choir_groups', 'view', 'Zobrazení skupin'),
  ('choir_groups', 'create', 'Vytváření skupin'),
  ('choir_groups', 'edit', 'Úprava skupin'),
  ('choir_groups', 'delete', 'Mazání skupin'),
  ('settings', 'view', 'Zobrazení nastavení'),
  ('settings', 'edit', 'Úprava základního nastavení'),
  ('settings', 'manage', 'Správa pokročilého nastavení'),
  ('users', 'view', 'Zobrazení uživatelů'),
  ('users', 'create', 'Vytváření uživatelů'),
  ('users', 'edit', 'Úprava uživatelů'),
  ('users', 'delete', 'Mazání uživatelů'),
  ('repertoire', 'view', 'Zobrazení repertoáru'),
  ('repertoire', 'create', 'Přidávání skladeb do repertoáru'),
  ('repertoire', 'edit', 'Úprava skladeb v repertoáru'),
  ('repertoire', 'delete', 'Mazání skladeb z repertoáru'),
  ('member_directory', 'view', 'Zobrazení seznamu členů'),
  ('member_directory', 'create', 'Přidávání členů'),
  ('member_directory', 'edit', 'Úprava informací o členech'),
  ('member_directory', 'delete', 'Mazání členů'),
  ('member_resources', 'view', 'Zobrazení dokumentů pro členy'),
  ('member_resources', 'create', 'Nahrávání dokumentů pro členy'),
  ('member_resources', 'edit', 'Úprava metadat dokumentů pro členy'),
  ('member_resources', 'delete', 'Mazání dokumentů pro členy'),
  ('form_messages', 'view', 'Zobrazení zpráv z formuláře'),
  ('form_messages', 'create', 'Přidávání zpráv z formuláře'),
  ('form_messages', 'edit', 'Úprava zpráv z formuláře'),
  ('form_messages', 'delete', 'Mazání zpráv z formuláře'),
  ('audit', 'view', 'Zobrazení auditních záznamů'),
  ('audit', 'manage', 'Správa konfigurace auditu'),
  ('forum_view', 'view', 'Zobrazení fóra v členské sekci'),
  ('forum_create', 'create', 'Vytváření témat a odpovědí'),
  ('forum_delete', 'delete', 'Mazání témat a odpovědí'),
  ('forum_categories', 'manage', 'Správa kategorií fóra'),
  ('forum_tags', 'manage', 'Správa tagů fóra'),
  ('emails', 'view', 'Zobrazení historie emailů'),
  ('emails', 'manage', 'Správa emailů a příjemců'),
  ('members_area', 'view', 'Přístup do členské sekce')
on conflict (section, action) do nothing;

-- Create trigger function for auto-creating user_roles
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (email, role)
  values (new.email, 'viewer')
  on conflict (email) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Insert initial admin role for your email
insert into user_roles (email, role)
values ('iimichal.svoboda@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';

-- Grant all permissions to admin users
insert into user_permissions (role_id, permission_id)
select ur.id, p.id
from user_roles ur
cross join permissions p
where ur.role = 'admin'
on conflict (role_id, permission_id) do nothing;