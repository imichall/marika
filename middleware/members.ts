import { useSupabaseClient } from '#imports'

interface RequiredPermission {
  section: string
  action: 'view' | 'create' | 'edit' | 'delete'
}

const routePermissions: Record<string, RequiredPermission> = {
  '/clenska-sekce': { section: 'members_area', action: 'view' },
  '/clenska-sekce/repertoar': { section: 'repertoire', action: 'view' },
  '/clenska-sekce/clenove': { section: 'member_directory', action: 'view' },
  '/clenska-sekce/zpravy': { section: 'members_area', action: 'view' },
  '/clenska-sekce/ke-stazeni': { section: 'member_resources', action: 'view' }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email

  if (!email) {
    return navigateTo(`/clenska-sekce/prihlaseni?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Administrátoři mají přístup všude
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('email', email)
    .single()

  if (roleError) {
    console.error('Nepodařilo se načíst roli uživatele v členské sekci:', roleError)
  }

  if (roleData?.role === 'admin') {
    return
  }

  let required = routePermissions[to.path]
  if (!required && to.path.startsWith('/clenska-sekce/zpravy/')) {
    required = routePermissions['/clenska-sekce/zpravy']
  }

  if (!required) {
    return
  }

  const { data: hasPermission, error: permError } = await supabase.rpc('check_permission', {
    p_email: email,
    p_section: required.section,
    p_action: required.action
  })

  if (permError) {
    console.error('Chyba při ověřování oprávnění členské sekce:', permError)
  }

  if (!hasPermission) {
    return navigateTo('/clenska-sekce/neni-opravneni')
  }
})

