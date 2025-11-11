CREATE OR REPLACE FUNCTION update_user_role(
  p_email varchar(255),
  p_role user_role_type
)
RETURNS boolean
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
DECLARE
  v_role_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.email = auth.jwt() ->> 'email'
      AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.user_roles (email, role)
  VALUES (p_email, p_role)
  ON CONFLICT (email)
  DO UPDATE SET role = p_role
  RETURNING id INTO v_role_id;

  DELETE FROM user_permissions
  WHERE role_id = v_role_id;

  IF p_role = 'admin' THEN
    INSERT INTO user_permissions (role_id, permission_id)
    SELECT v_role_id, p.id
    FROM permissions p
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  ELSIF p_role = 'editor' THEN
    INSERT INTO user_permissions (role_id, permission_id)
    SELECT v_role_id, permission_id
    FROM user_permissions up
    JOIN user_roles ur ON ur.id = up.role_id
    WHERE ur.role = p_role
      AND ur.email = format('default.%s@system.local', p_role)
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    IF NOT EXISTS (SELECT 1 FROM user_permissions up WHERE up.role_id = v_role_id) THEN
      INSERT INTO user_permissions (role_id, permission_id)
      SELECT v_role_id, p.id
      FROM permissions p
      WHERE
        (p.section = 'concerts' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'gallery' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'testimonials' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'orders' AND p.action IN ('view', 'edit', 'complete', 'cancel')) OR
        (p.section = 'social_media' AND p.action IN ('view', 'edit')) OR
        (p.section = 'contacts' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'choir_groups' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'settings' AND p.action IN ('view', 'edit')) OR
        (p.section = 'forum_view' AND p.action = 'view') OR
        (p.section = 'forum_create' AND p.action = 'create') OR
        (p.section = 'forum_delete' AND p.action = 'delete') OR
        (p.section = 'forum_categories' AND p.action = 'manage') OR
        (p.section = 'forum_tags' AND p.action = 'manage') OR
        (p.section = 'emails' AND p.action IN ('view', 'manage')) OR
        (p.section = 'repertoire' AND p.action IN ('view', 'create', 'edit')) OR
        (p.section = 'member_directory' AND p.action IN ('view', 'create', 'edit', 'delete')) OR
        (p.section = 'member_resources' AND p.action IN ('view', 'create', 'edit')) OR
        (p.section = 'members_area' AND p.action = 'view')
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
  ELSE
    INSERT INTO user_permissions (role_id, permission_id)
    SELECT v_role_id, permission_id
    FROM user_permissions up
    JOIN user_roles ur ON ur.id = up.role_id
    WHERE ur.role = p_role
      AND ur.email = format('default.%s@system.local', p_role)
    ON CONFLICT (role_id, permission_id) DO NOTHING;

    IF NOT EXISTS (SELECT 1 FROM user_permissions up WHERE up.role_id = v_role_id) THEN
      INSERT INTO user_permissions (role_id, permission_id)
      SELECT v_role_id, p.id
      FROM permissions p
      WHERE p.section IN (
        'concerts', 'gallery', 'testimonials', 'orders', 'social_media',
        'contacts', 'choir_groups', 'settings', 'repertoire',
        'member_directory', 'member_resources', 'members_area',
        'emails', 'forum_view'
      )
      AND p.action = 'view'
      ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;
