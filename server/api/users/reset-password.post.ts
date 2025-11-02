import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { createError, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userEmail } = body

    if (!userEmail) {
      throw createError({
        statusCode: 400,
        message: 'Email uživatele je povinný'
      })
    }

    // Získáme aktuálního přihlášeného uživatele
    const client = await serverSupabaseClient(event)
    const { data: { user: currentUser }, error: userError } = await client.auth.getUser()

    if (userError || !currentUser?.email) {
      throw createError({
        statusCode: 401,
        message: 'Musíte být přihlášeni'
      })
    }

    // Kontrola, zda je aktuální uživatel admin
    const { data: userRole, error: roleError } = await client
      .from('user_roles')
      .select('role')
      .eq('email', currentUser.email)
      .single()

    if (roleError || !userRole || (userRole as any).role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Pouze admin může resetovat hesla uživatelů'
      })
    }

    // Vytvoříme admin klienta s service role key
    const config = useRuntimeConfig()
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Supabase config check:', {
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Missing',
      'config.supabaseServiceRoleKey': config.supabaseServiceRoleKey ? 'Set' : 'Missing'
    })

    // Debug all env vars that start with SUPABASE
    console.log('All SUPABASE env vars:', Object.keys(process.env).filter(k => k.startsWith('SUPABASE')))

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration:', { supabaseUrl, supabaseServiceKey: '***' })
      throw createError({
        statusCode: 500,
        message: 'Chybí konfigurace Supabase'
      })
    }

    // Vytvoříme admin klienta
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Odeslání emailu pro reset hesla
    // Získáme base URL z konfigurace nebo z requestu
    const runtimeConfig = useRuntimeConfig()
    let baseUrl = runtimeConfig.siteUrl || runtimeConfig.public.siteUrl

    if (!baseUrl) {
      // Fallback na host z requestu (pouze pro dev)
      const host = getHeader(event, 'host') || 'localhost:3000'
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
      baseUrl = `${protocol}://${host}`
    }

    console.log('Generating reset link for:', userEmail, 'redirectTo:', `${baseUrl}/admin/reset-password`)

    const { data, error: resetError } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: userEmail,
      options: {
        redirectTo: `${baseUrl}/admin/reset-password`
      }
    })

    if (resetError) {
      console.error('Error generating reset password link:', resetError)
      throw createError({
        statusCode: 500,
        message: 'Nepodařilo se odeslat email pro reset hesla: ' + resetError.message
      })
    }

    console.log('Reset link generated successfully:', data)

    return {
      success: true,
      message: 'Email pro reset hesla byl úspěšně odeslán'
    }
  } catch (err: any) {
    console.error('Error resetting password:', err)

    // Pokud je to už naše vlastní chyba, hodíme ji dál
    if (err.statusCode) {
      throw err
    }

    // Jinak vytvoříme novou chybu
    throw createError({
      statusCode: 500,
      message: err.message || 'Nepodařilo se odeslat email pro reset hesla'
    })
  }
})

