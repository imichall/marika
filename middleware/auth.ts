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

  // Kontrola, zda je uživatel v admin_users tabulce
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', user.value.email)
    .single()

  if (adminError || !adminUser) {
    console.error('Uživatel není administrátor:', user.value.email)
    return navigateTo('/admin/login')
  }
})