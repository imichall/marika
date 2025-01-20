import { createClient } from '@supabase/supabase-js'

export const useSupabaseClient = () => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration:', { supabaseUrl, supabaseKey })
    throw new Error('Supabase configuration is missing')
  }

  const client = createClient(supabaseUrl, supabaseKey)

  // Test connection
  console.log('Supabase client created with URL:', supabaseUrl)

  return client
}