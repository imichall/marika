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
  // Přihlašovací stránka není chráněná
  if (to.path === '/clenska-sekce/prihlaseni') {
    return
  }

  const supabase = useSupabaseClient()

  // Kontrola, zda je přihlášen přes oddíl
  if (process.client) {
    const memberDepartment = localStorage.getItem('memberDepartment')
    if (memberDepartment) {
      try {
        const dept = JSON.parse(memberDepartment)

        // Výchozí permissions pokud nejsou nastaveny
        const defaultPermissions = {
          repertoire_view: true,
          repertoire_edit: false,
          member_directory_view: true,
          members_area_view: true,
          member_resources_view: true,
          member_resources_upload: false
        }

        // Zajistíme, že permissions jsou vždy objekt s boolean hodnotami
        let permissions = dept.permissions || defaultPermissions

        // Pokud permissions není objekt nebo je null/undefined, použijeme default
        if (!permissions || typeof permissions !== 'object') {
          permissions = defaultPermissions
        }

        // Zajistíme, že všechny permission hodnoty jsou booleany
        const normalizedPermissions: Record<string, boolean> = {
          repertoire_view: permissions.repertoire_view === true,
          repertoire_edit: permissions.repertoire_edit === true,
          member_directory_view: permissions.member_directory_view === true,
          members_area_view: permissions.members_area_view === true,
          member_resources_view: permissions.member_resources_view === true,
          member_resources_upload: permissions.member_resources_upload === true
        }

        permissions = normalizedPermissions

        // Kontrola oprávnění podle cesty
        const permissionMap: Record<string, string> = {
          '/clenska-sekce': 'members_area_view',
          '/clenska-sekce/repertoar': 'repertoire_view',
          '/clenska-sekce/clenove': 'member_directory_view',
          '/clenska-sekce/zpravy': 'members_area_view',
          '/clenska-sekce/ke-stazeni': 'member_resources_view'
        }

        let requiredPermission = permissionMap[to.path]
        if (!requiredPermission && to.path.startsWith('/clenska-sekce/zpravy/')) {
          requiredPermission = 'members_area_view'
        }

        // Pokud je vyžadováno oprávnění, zkontroluj, zda ho oddíl má
        if (requiredPermission) {
          const hasPermission = permissions[requiredPermission as keyof typeof permissions]

          // Debug log pro ladění (zobrazí se i při SSR)
          if (process.client) {
            console.log('🔍 Department permissions check:', {
              path: to.path,
              requiredPermission,
              hasPermission,
              hasPermissionType: typeof hasPermission,
              allPermissions: permissions,
              willAllow: hasPermission === true
            })
          }

          if (hasPermission !== true) {
            if (process.client) {
              console.error('❌ Access denied! Permission check failed:', {
                requiredPermission,
                hasPermission,
                expected: true
              })
            }
            return navigateTo('/clenska-sekce/neni-opravneni')
          }

          if (process.client) {
            console.log('✅ Access granted!')
          }
        }

        // Uživatel má potřebné oprávnění
        return
      } catch (err) {
        console.error('Chyba při parsování memberDepartment:', err)
        // Pokud se nepodaří parsovat, pokračuj na běžnou autentizaci
      }
    }
  }

  // Pokud není přihlášen přes oddíl, zkontrolujeme běžnou auth
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

