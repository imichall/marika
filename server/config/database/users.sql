-- Drop existing objects
drop function if exists get_users();
drop table if exists user_roles cascade;
drop type if exists user_role_type cascade;

-- Create role type
create type user_role_type as enum ('admin', 'editor', 'viewer');

-- Create roles table
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  role user_role_type not null default 'viewer',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint fk_admin_users
    foreign key (email)
    references admin_users(email)
    on delete cascade
);

-- Create index for faster lookups
create index user_roles_email_idx on user_roles(email);

-- Enable Row Level Security
alter table user_roles enable row level security;

-- Policies for user_roles table
create policy "Users can view their own role"
  on user_roles for select
  using (auth.jwt() ->> 'email' = email);

create policy "Admins can view all roles"
  on user_roles for select
  using (
    exists (
      select 1 from admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

create policy "Only admins can insert roles"
  on user_roles for insert
  with check (
    exists (
      select 1 from admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

create policy "Only admins can update roles"
  on user_roles for update
  using (
    exists (
      select 1 from admin_users
      where email = auth.jwt() ->> 'email'
    )
  );

create policy "Only admins can delete roles"
  on user_roles for delete
  using (
    exists (
      select 1 from admin_users
      where email = auth.jwt() ->> 'email'
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

create trigger update_user_roles_updated_at
    before update on user_roles
    for each row
    execute function update_updated_at_column();

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
    select 1 from public.admin_users au
    join public.user_roles ur on au.email = ur.email
    where au.email = auth.jwt() ->> 'email'
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
      (au.id is not null) as is_admin,
      coalesce(ur.role, 'viewer'::user_role_type) as role
    from auth.users u
    left join public.admin_users au on au.email = u.email
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
begin
  -- Check if the current user is admin
  if not exists (
    select 1 from public.admin_users au
    join public.user_roles ur on au.email = ur.email
    where au.email = auth.jwt() ->> 'email'
    and ur.role = 'admin'
  ) then
    raise exception 'Unauthorized';
  end if;

  -- Insert or update role
  insert into public.user_roles (email, role)
  values (p_email, p_role)
  on conflict (email)
  do update set role = p_role;

  return true;
end;
$$;

-- Insert initial admin roles for existing admin users
insert into user_roles (email, role)
select email, 'admin'::user_role_type
from admin_users
on conflict (email) do nothing;