export default defineNuxtRouteMiddleware(async (to) => {
  // Pokud nejsme na admin cestě, pokračujeme
  if (!to.path.startsWith('/admin')) {
    return
  }

  const { user, checkUser } = useAuth()
  const supabase = useSupabaseClient()

  // Kontrola aktuální session
  await checkUser()

  // Přístup na přihlašovací stránku pouze pro nepřihlášené
  if (to.path === '/admin/login') {
    if (user.value) {
      return navigateTo('/admin')
    }
    return
  }

  // Pro všechny ostatní admin cesty vyžadujeme autentizaci
  if (!user.value || !user.value.email) {
    return navigateTo('/admin/login')
  }

  // Kontrola, zda je uživatel v user_roles tabulce a má roli admin nebo editor
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('email', user.value.email)
    .single()

  if (roleError || !userRole || (userRole.role !== 'admin' && userRole.role !== 'editor')) {
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
  ]

  // Normalizace cesty - odstranění trailing slash
  const normalizedPath = to.path.replace(/\/$/, '')

  // Pokud cesta není v seznamu povolených, přesměruj na 404
  if (!validAdminRoutes.includes(normalizedPath)) {
    return navigateTo('/404')
  }
})