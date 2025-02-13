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
create type permission_action_type as enum ('view', 'create', 'edit', 'delete', 'manage');

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

-- Function to check permission
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
begin
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

  -- Delete existing permissions for the user
  delete from user_permissions up
  using user_roles ur
  where ur.email = p_email
  and ur.id = up.role_id;

  -- Update or insert the role
  insert into public.user_roles (email, role)
  values (p_email, p_role)
  on conflict (email)
  do update set role = p_role
  returning id into v_role_id;

  -- If setting admin role, grant all permissions
  if p_role = 'admin' then
    insert into user_permissions (role_id, permission_id)
    select v_role_id, p.id
    from permissions p
    on conflict (role_id, permission_id) do nothing;
  end if;

  -- If setting editor role, grant editor permissions
  if p_role = 'editor' then
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
      -- Objednávky - pouze zobrazení a úpravy
      or (p.section = 'orders' and p.action in ('view', 'edit'))
      -- Skupiny - plný přístup
      or (p.section = 'choir_groups' and p.action in ('view', 'create', 'edit', 'delete'))
      -- Kontakty - zobrazení a úpravy
      or (p.section = 'contacts' and p.action in ('view', 'edit'))
      -- Sociální sítě - zobrazení a úpravy
      or (p.section = 'social_media' and p.action in ('view', 'edit'))
      -- Nastavení - pouze základní
      or (p.section = 'settings' and p.action in ('view', 'edit'))
    on conflict (role_id, permission_id) do nothing;
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
  ('social_media', 'view', 'Zobrazení sociálních sítí'),
  ('social_media', 'edit', 'Správa sociálních sítí'),
  ('contacts', 'view', 'Zobrazení kontaktů'),
  ('contacts', 'edit', 'Úprava kontaktů'),
  ('choir_groups', 'view', 'Zobrazení skupin'),
  ('choir_groups', 'create', 'Vytváření skupin'),
  ('choir_groups', 'edit', 'Úprava skupin'),
  ('choir_groups', 'delete', 'Mazání skupin'),
  ('settings', 'view', 'Zobrazení nastavení'),
  ('settings', 'edit', 'Úprava základního nastavení'),
  ('settings', 'manage', 'Správa pokročilého nastavení'),
  ('users', 'view', 'Zobrazení uživatelů'),
  ('users', 'edit', 'Správa uživatelů')
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