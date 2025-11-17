import { useSupabaseClient } from '#imports'

interface PathPermission {
  section: string;
  action: string;
}

interface PathPermissions {
  [key: string]: PathPermission;
}

export default defineNuxtRouteMiddleware(async (to) => {
  // Pokud jsme na hlavní admin stránce nebo přihlášení, povolíme přístup
  if (to.path === '/admin' || to.path === '/admin/login') {
    return
  }

  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return navigateTo('/admin/login')
  }

  // Získáme roli uživatele a jeho oprávnění
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('email', user.email)
    .single()

  if (roleError || !userRole) {
    console.error('Uživatel nemá přiřazenou roli:', user.email)
    return navigateTo('/admin/login')
  }

  // Stránka s oprávněními je dostupná pouze pro adminy
  if (to.path === '/admin/opravneni') {
    if (userRole.role !== 'admin') {
      console.error('Stránka s oprávněními je dostupná pouze pro adminy:', user.email, 'role:', userRole.role)
      return navigateTo('/admin?error=nemate-opravneni')
    }
    // Pokud je admin, povolíme přístup
    return
  }

  // Admin má přístup všude
  if (userRole.role === 'admin') {
    return
  }

  // Pro ostatní role kontrolujeme specifická oprávnění
  // Mapování cest na sekce a požadované akce
  const pathPermissions: PathPermissions = {
    '/admin/koncerty': { section: 'concerts', action: 'view' },
    '/admin/galerie': { section: 'gallery', action: 'view' },
    '/admin/reference': { section: 'testimonials', action: 'view' },
    '/admin/objednavky': { section: 'orders', action: 'view' },
    '/admin/socialni-site': { section: 'social_media', action: 'view' },
    '/admin/kontakty': { section: 'contacts', action: 'view' },
    '/admin/skupiny': { section: 'choir_groups', action: 'view' },
    '/admin/nastaveni': { section: 'settings', action: 'view' },
    '/admin/uzivatele': { section: 'users', action: 'view' },
    '/admin/zpravy': { section: 'form_messages', action: 'view' },
    '/admin/emaily': { section: 'emails', action: 'view' },
    '/admin/emaily/nahled': { section: 'emails', action: 'view' },
    '/admin/audit': { section: 'audit', action: 'view' },
    '/admin/media': { section: 'media', action: 'view' },
    '/admin/forum': { section: 'forum_view', action: 'view' },
    '/admin/forum/agenda': { section: 'forum_view', action: 'view' }
  }

  // Kontrola oprávnění pro aktuální cestu
  const requiredPermission = pathPermissions[to.path]
  if (requiredPermission) {
    // Kontrola oprávnění v databázi
    const { data: hasPermission, error: permError } = await supabase
      .rpc('check_permission', {
        p_email: user.email,
        p_section: requiredPermission.section,
        p_action: requiredPermission.action
      })

    if (permError || !hasPermission) {
      console.error('Uživatel nemá potřebná oprávnění:', user.email, requiredPermission)
      return navigateTo('/admin?error=nemate-opravneni')
    }
  } else {
    // Kontrola, zda cesta začíná na /admin/emaily/
    if (to.path.startsWith('/admin/emaily/')) {
      const { data: hasPermission, error: permError } = await supabase
        .rpc('check_permission', {
          p_email: user.email,
          p_section: 'emails',
          p_action: 'view'
        })

      if (permError || !hasPermission) {
        console.error('Uživatel nemá potřebná oprávnění:', user.email, { section: 'emails', action: 'view' })
        return navigateTo('/admin?error=nemate-opravneni')
      }
      return
    }

    // Kontrola, zda cesta začíná na /admin/forum/ (dynamické cesty jako /admin/forum/[id])
    if (to.path.startsWith('/admin/forum/') && to.path !== '/admin/forum' && to.path !== '/admin/forum/agenda') {
      const { data: hasPermission, error: permError } = await supabase
        .rpc('check_permission', {
          p_email: user.email,
          p_section: 'forum_view',
          p_action: 'view'
        })

      if (permError || !hasPermission) {
        console.error('Uživatel nemá potřebná oprávnění:', user.email, { section: 'forum_view', action: 'view' })
        return navigateTo('/admin?error=nemate-opravneni')
      }
      return
    }

    if (to.path.startsWith('/admin/audit/')) {
      const { data: hasPermission, error: permError } = await supabase
        .rpc('check_permission', {
          p_email: user.email,
          p_section: 'audit',
          p_action: 'view'
        })

      if (permError || !hasPermission) {
        console.error('Uživatel nemá potřebná oprávnění:', user.email, { section: 'audit', action: 'view' })
        return navigateTo('/admin?error=nemate-opravneni')
      }
      return
    }

    // Pokud cesta není v seznamu povolených, přesměrujeme na hlavní admin stránku
    return navigateTo('/admin?error=sekce-neni-dostupna')
  }
})