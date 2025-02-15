export default defineNuxtRouteMiddleware(async (to) => {
  // Pokud nejsme na admin cestě, pokračujeme
  if (!to.path.startsWith('/admin')) {
    return
  }

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Pokud uživatel není přihlášený a není na přihlašovací stránce, přesměruj na login
  if (!user.value && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }

  // Pokud je uživatel na přihlašovací stránce a je přihlášený, přesměruj na admin
  if (user.value && to.path === '/admin/login') {
    return navigateTo('/admin')
  }

  // Pokud je uživatel přihlášený a není na přihlašovací stránce
  if (user.value && to.path !== '/admin/login') {
    try {
      // Kontrola, zda má uživatel přístup do administrace
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', user.value.email)
        .single()

      if (roleError) throw roleError

      if (!userRole || !userRole.role) {
        console.error('Uživatel nemá potřebná oprávnění:', user.value.email)
        return navigateTo('/admin/login')
      }

      // Seznam povolených admin sekcí
      const validAdminRoutes = [
        '/admin',
        '/admin/index',
        '/admin/koncerty',
        '/admin/galerie',
        '/admin/reference',
        '/admin/objednavky',
        '/admin/socialni-site',
        '/admin/kontakty',
        '/admin/skupiny',
        '/admin/system',
        '/admin/login',
        '/admin/changelog',
        '/admin/uzivatele',
        '/admin/opravneni',
        '/admin/zpravy',
        '/admin/audit',
        '/admin/emaily',
        '/admin/emaily/list',
        '/admin/emaily/preview',
      ]

      // Normalizace cesty - odstranění trailing slash
      const normalizedPath = to.path.replace(/\/$/, '')

      // Pokud cesta není v seznamu povolených, přesměruj na 404
      if (!validAdminRoutes.includes(normalizedPath)) {
        return navigateTo('/404')
      }

      // Pokud je vše v pořádku, pokračuj
      return
    } catch (err) {
      console.error('Chyba při ověřování oprávnění:', err)
      return navigateTo('/admin/login')
    }
  }
})