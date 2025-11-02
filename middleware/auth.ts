export default defineNuxtRouteMiddleware(async (to) => {
  // Pokud nejsme na admin cestě, pokračujeme
  if (!to.path.startsWith('/admin')) {
    return
  }

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Veřejné trasy pro admin sekci (bez autentizace)
  const publicAdminRoutes = ['/admin/login', '/admin/reset-password']

  // Pokud uživatel není přihlášený a není na veřejné trase, přesměruj na login
  if (!user.value && !publicAdminRoutes.includes(to.path)) {
    return navigateTo('/admin/login')
  }

  // Pokud je uživatel na přihlašovací stránce a je přihlášený, přesměruj na admin
  if (user.value && to.path === '/admin/login') {
    return navigateTo('/admin')
  }

  // Pokud je uživatel na reset stránce a je přihlášený, přesměruj na admin (aby se přihlásil s novým heslem)
  if (user.value && to.path === '/admin/reset-password') {
    // Ale necháme to, protože možná právě resetuje heslo
  }

  // Pokud je uživatel přihlášený a není na veřejné stránce
  if (user.value && !publicAdminRoutes.includes(to.path)) {
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
        '/admin/media',
        '/admin/forum',
        '/admin/forum/agenda',
        '/admin/reset-password',
      ]

      // Normalizace cesty - odstranění trailing slash
      const normalizedPath = to.path.replace(/\/$/, '')

      // Kontrola dynamických cest (např. /admin/forum/[id])
      const isDynamicForumRoute = normalizedPath.startsWith('/admin/forum/') && normalizedPath !== '/admin/forum'

      // Pokud cesta není v seznamu povolených a není dynamická cesta fóra, přesměruj na 404
      if (!validAdminRoutes.includes(normalizedPath) && !isDynamicForumRoute) {
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