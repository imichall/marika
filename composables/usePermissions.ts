import { ref } from 'vue'
// @ts-ignore #imports is provided by Nuxt auto-imports
import { useSupabaseClient } from '#imports'

export const usePermissions = () => {
  const supabase = useSupabaseClient()

  /**
   * Kontroluje, zda má aktuální uživatel dané oprávnění
   * @param section - Sekce oprávnění (např. 'users', 'concerts', 'gallery')
   * @param action - Akce oprávnění (např. 'view', 'edit', 'create', 'delete')
   * @returns Promise<boolean> - true pokud má uživatel oprávnění, jinak false
   */
  const checkPermission = async (section: string, action: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user?.email) {
        return false
      }

      // Kontrola, zda je uživatel admin (admin má všechna oprávnění)
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', user.email)
        .single()

      if (userRole?.role === 'admin') {
        return true
      }

      // Kontrola konkrétního oprávnění
      const { data: hasPermission, error } = await supabase
        .rpc('check_permission', {
          p_email: user.email,
          p_section: section,
          p_action: action
        })

      if (error) {
        console.error('Chyba při kontrole oprávnění:', error)
        return false
      }

      return Boolean(hasPermission)
    } catch (err) {
      console.error('Chyba při kontrole oprávnění:', err)
      return false
    }
  }

  /**
   * Kontroluje více oprávnění najednou
   * @param permissions - Pole objektů s section a action
   * @returns Promise<Record<string, boolean>> - Objekt s výsledky pro každé oprávnění
   */
  const checkMultiplePermissions = async (
    permissions: Array<{ section: string; action: string; key?: string }>
  ): Promise<Record<string, boolean>> => {
    try {
      const results = await Promise.all(
        permissions.map(async ({ section, action, key }) => {
          const hasPermission = await checkPermission(section, action)
          const resultKey = key || `${section}:${action}`
          return [resultKey, hasPermission] as const
        })
      )

      return Object.fromEntries(results)
    } catch (err) {
      console.error('Chyba při kontrole více oprávnění:', err)
      return {}
    }
  }

  return {
    checkPermission,
    checkMultiplePermissions
  }
}

