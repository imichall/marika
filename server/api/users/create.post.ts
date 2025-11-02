import { serverSupabaseClient } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'
import { createError, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, role, name } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        message: 'Email je povinný'
      })
    }

    if (!password) {
      throw createError({
        statusCode: 400,
        message: 'Heslo je povinné'
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
        message: 'Pouze admin může vytvářet nové uživatele'
      })
    }

    // Vytvoříme admin klienta s service role key
    const config = useRuntimeConfig()
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

    // Získáme base URL z konfigurace nebo z requestu pro potvrzovací odkaz
    const runtimeConfig = useRuntimeConfig()
    let baseUrl = runtimeConfig.siteUrl || runtimeConfig.public.siteUrl

    // Pokud není nastaveno v env, zkontrolujeme host z requestu
    if (!baseUrl) {
      const host = getHeader(event, 'host') || 'localhost:3000'

      // Pokud je to localhost nebo 127.0.0.1, použijeme fallback na produkční URL
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

    console.log('Using baseUrl for user creation:', baseUrl)

    console.log('Creating user:', email, 'redirectTo:', `${baseUrl}/admin/login`)

    // Vytvoříme uživatele pomocí Admin API
    const { data: newUser, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Necháme uživatele potvrdit e-mail
      user_metadata: name ? { full_name: name } : {}
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      throw createError({
        statusCode: 500,
        message: 'Nepodařilo se vytvořit uživatele: ' + createUserError.message
      })
    }

    if (!newUser.user) {
      throw createError({
        statusCode: 500,
        message: 'Uživatel nebyl vytvořen'
      })
    }

    // Nastavíme roli v user_roles tabulce
    const selectedRole = role || 'viewer'
    const { data: userRoleData, error: roleInsertError } = await adminClient
      .from('user_roles')
      .upsert({
        email: email.toLowerCase(),
        role: selectedRole
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (roleInsertError) {
      console.error('Error setting user role:', roleInsertError)
      // Necháme to projít, protože uživatel byl vytvořen, jen role se nepodařila nastavit
    } else if (userRoleData && userRoleData.id) {
      // Zkopírujeme permissions z default role pro danou roli
      // Pro adminy kopírujeme všechna permissions
      if (selectedRole === 'admin') {
        // Získáme všechna permissions
        const { data: allPermissions, error: permSelectError } = await adminClient
          .from('permissions')
          .select('id')

        if (!permSelectError && allPermissions && allPermissions.length > 0) {
          // Vložíme všechna permissions pro nového admina
          const permissionsToInsert = allPermissions.map(p => ({
            role_id: userRoleData.id,
            permission_id: p.id
          }))

          const { error: permInsertError } = await adminClient
            .from('user_permissions')
            .insert(permissionsToInsert)

          if (permInsertError && !permInsertError.message.includes('duplicate')) {
            console.error('Error granting admin permissions:', permInsertError)
          }
        }
      } else {
        // Pro viewer a editor zkopírujeme permissions z default role
        const defaultRoleEmail = `default.${selectedRole}@system.local`

        // Najdeme default role ID
        const { data: defaultRole, error: defaultRoleError } = await adminClient
          .from('user_roles')
          .select('id')
          .eq('email', defaultRoleEmail)
          .single()

        if (!defaultRoleError && defaultRole) {
          // Zkopírujeme permissions z default role
          const { data: defaultPermissions, error: permSelectError } = await adminClient
            .from('user_permissions')
            .select('permission_id')
            .eq('role_id', defaultRole.id)

          if (!permSelectError && defaultPermissions && defaultPermissions.length > 0) {
            // Vložíme permissions pro nového uživatele (pouze pro něj, nepro ostatní)
            const permissionsToInsert = defaultPermissions.map(p => ({
              role_id: userRoleData.id,
              permission_id: p.permission_id
            }))

            const { error: permInsertError } = await adminClient
              .from('user_permissions')
              .insert(permissionsToInsert)

            if (permInsertError && !permInsertError.message.includes('duplicate')) {
              console.error('Error copying permissions from default role:', permInsertError)
            }
          }
        } else {
          console.warn(`Default role ${defaultRoleEmail} not found. Permissions will not be copied.`)
        }
      }
    }

    // Odeslání potvrzovacího e-mailu
    const { error: inviteError } = await adminClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: `${baseUrl}/admin/login`
      }
    })

    if (inviteError) {
      console.error('Error generating invite link:', inviteError)
      // Necháme to projít, protože uživatel byl vytvořen, jen e-mail se nepodařil odeslat
      console.warn('Uživatel byl vytvořen, ale nepodařilo se odeslat potvrzovací e-mail:', inviteError.message)
    }

    return {
      success: true,
      message: 'Uživatel byl úspěšně vytvořen a potvrzovací e-mail byl odeslán',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        role: selectedRole
      }
    }
  } catch (err: any) {
    console.error('Error creating user:', err)

    // Pokud je to už naše vlastní chyba, hodíme ji dál
    if (err.statusCode) {
      throw err
    }

    // Jinak vytvoříme novou chybu
    throw createError({
      statusCode: 500,
      message: err.message || 'Nepodařilo se vytvořit uživatele'
    })
  }
})

