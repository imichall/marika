-- Drop existing objects
drop table if exists settings cascade;

-- Create settings table
create table settings (
  id uuid primary key default gen_random_uuid(),
  title varchar(255),
  contact_email varchar(255),
  facebook_url text,
  instagram_url text,
  analytics_id varchar(50),
  mailchimp_api_key varchar(100),
  cache_ttl integer default 60,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table settings enable row level security;

-- Create policies
create policy "Everyone can view settings"
  on settings for select
  using (true);

create policy "Users with edit permission can update basic settings"
  on settings for update
  using (
    exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'settings'
      and p.action in ('edit', 'manage')
    )
  )
  with check (
    case
      when exists (
        select 1
        from user_roles ur
        join user_permissions up on ur.id = up.role_id
        join permissions p on p.id = up.permission_id
        where ur.email = auth.jwt() ->> 'email'
        and p.section = 'settings'
        and p.action = 'manage'
      ) then true
      when exists (
        select 1
        from user_roles ur
        join user_permissions up on ur.id = up.role_id
        join permissions p on p.id = up.permission_id
        where ur.email = auth.jwt() ->> 'email'
        and p.section = 'settings'
        and p.action = 'edit'
      ) then
        analytics_id is null and
        mailchimp_api_key is null and
        cache_ttl = 60
      else false
    end
  );

create policy "Users with manage permission can insert settings"
  on settings for insert
  with check (
    exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'settings'
      and p.action = 'manage'
    )
  );

-- Update trigger for updated_at
create trigger update_settings_updated_at
    before update on settings
    for each row
    execute function update_updated_at_column();

-- Insert default settings
insert into settings (
  title,
  contact_email,
  facebook_url,
  instagram_url,
  analytics_id,
  mailchimp_api_key,
  cache_ttl
) values (
  'Marika',
  'info@marika.cz',
  'https://facebook.com/marika',
  'https://instagram.com/marika',
  null,
  null,
  60
) on conflict (id) do nothing;