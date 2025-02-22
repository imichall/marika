-- Nejdřív odstraníme existující funkci
DROP FUNCTION IF EXISTS public.get_users();

-- Vytvoříme novou funkci
CREATE OR REPLACE FUNCTION public.get_users()
RETURNS TABLE (
  id uuid,
  email varchar(255),
  name varchar(255),
  role varchar(255),
  is_admin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  confirmed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id,
    au.email::varchar(255),
    ur.name::varchar(255),
    ur.role::varchar(255),
    ur.role = 'admin' as is_admin,
    au.created_at,
    au.last_sign_in_at,
    au.confirmed_at
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.email = ur.email
  ORDER BY au.created_at DESC;
END;
$$;