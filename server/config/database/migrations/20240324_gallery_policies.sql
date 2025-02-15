-- Drop existing policies
drop policy if exists "Gallery is editable by admins" on gallery;
drop policy if exists "Gallery images are editable by admins" on storage.objects;

-- Create new policies for gallery table
create policy "Gallery is viewable by all"
  on gallery for select
  using (true);

create policy "Gallery is editable by users with permissions"
  on gallery for all
  using (
    exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'gallery'
      and p.action in ('create', 'edit', 'delete')
    )
  );

-- Create new policies for storage.objects table
create policy "Gallery images are viewable by all"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Gallery images are editable by users with permissions"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'gallery'
      and p.action = 'create'
    )
  );

create policy "Gallery images are deletable by users with permissions"
  on storage.objects for delete
  using (
    bucket_id = 'gallery'
    and exists (
      select 1
      from user_roles ur
      join user_permissions up on ur.id = up.role_id
      join permissions p on p.id = up.permission_id
      where ur.email = auth.jwt() ->> 'email'
      and p.section = 'gallery'
      and p.action = 'delete'
    )
  );