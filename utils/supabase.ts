import { createClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const useSupabaseClient = () => {
  const config = useRuntimeConfig()
  const appConfig = useAppConfig()

  // Prioritně použijeme runtime config, pak app config
  const supabaseUrl = config.public.supabaseUrl || appConfig.supabase.url
  const supabaseKey = config.public.supabaseKey || appConfig.supabase.key

  if (!supabaseUrl || !supabaseKey) {
    console.error('Chybí konfigurace Supabase:', { supabaseUrl, supabaseKey })
    throw new Error('Chybí konfigurace Supabase')
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase-auth'
        },
        global: {
          headers: {
            'x-client-info': 'marika-singers'
          }
        }
      })

      // Test připojení
      console.log('Supabase klient vytvořen s URL:', supabaseUrl)
    } catch (error) {
      console.error('Chyba při vytváření Supabase klienta:', error)
      throw error
    }
  }

  return supabaseInstance
}