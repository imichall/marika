-- Drop admin_users table as it's no longer needed
drop table if exists public.admin_users;

-- Make sure all existing admins are properly set in user_roles
insert into public.user_roles (email, role)
select distinct email, 'admin'::user_role_type
from (
  select email from public.admin_users
  except
  select email from public.user_roles where role = 'admin'
) as missing_admins;