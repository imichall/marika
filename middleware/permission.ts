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
    '/admin/opravneni': { section: 'users', action: 'edit' }
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
      return navigateTo('/admin', {
        query: {
          error: 'Nemáte potřebná oprávnění pro přístup do této sekce'
        }
      })
    }
  } else {
    // Pokud cesta není v seznamu povolených, přesměrujeme na hlavní admin stránku
    return navigateTo('/admin', {
      query: {
        error: 'Tato sekce není pro vás dostupná'
      }
    })
  }
})