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
    // Získáme base URL z konfigurace (produkce) nebo z requestu (dev)
    const runtimeConfig = useRuntimeConfig()
    let baseUrl = runtimeConfig.siteUrl || runtimeConfig.public.siteUrl

    // Pokud není nastaveno v env, zkontrolujeme host z requestu
    if (!baseUrl) {
      const host = getHeader(event, 'host') || 'localhost:3000'

      // Pokud je to localhost nebo 127.0.0.1, použijeme fallback na produkční URL
      // Nebo můžeme použít hardcoded produkční URL jako fallback
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        // Pro produkci použijeme fixní URL, pro dev použijeme localhost
        // V produkci by mělo být NUXT_PUBLIC_SITE_URL nastaveno!
        baseUrl = 'https://marikasingers.cz'
        console.warn('Using hardcoded production URL because request is from localhost. Set NUXT_PUBLIC_SITE_URL in environment variables!')
      } else {
        // Pokud není localhost, použijeme host z requestu
        const protocol = 'https'
        baseUrl = `${protocol}://${host}`
      }
    }

    console.log('Using baseUrl for password reset:', baseUrl)

    console.log('Sending password reset email for:', userEmail, 'redirectTo:', `${baseUrl}/admin/reset-password`)

    // Nejprve zkontrolujeme, zda uživatel existuje v auth.users
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()

    const existingUser = users?.users?.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        message: 'Uživatel s tímto emailem neexistuje v systému'
      })
    }

    console.log('User found in auth.users:', existingUser.id, existingUser.email)

    // Použijeme běžný auth klient (s anon key) pro odeslání e-mailu
    // Admin API generateLink vytváří link, ale neodesílá e-mail automaticky
    // resetPasswordForEmail odešle e-mail automaticky
    const authClient = createClient(supabaseUrl, process.env.NUXT_PUBLIC_SUPABASE_KEY || '', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Nastavíme redirect URL do cookies nebo použijeme options
    const { data: resetData, error: resetError } = await authClient.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${baseUrl}/admin/reset-password`
    })

    if (resetError) {
      console.error('Error sending password reset email:', resetError)
      throw createError({
        statusCode: 500,
        message: 'Nepodařilo se odeslat email pro reset hesla: ' + resetError.message
      })
    }

    console.log('Password reset email sent successfully:', resetData)
    console.log('Email by měl být odeslán přes SMTP server nakonfigurovaný v Supabase Dashboard.')

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

