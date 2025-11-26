import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { H3Event, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    // Získání informací o oddílu z body (pokud je přihlášen přes oddíl)
    const departmentData = body._departmentData || null
    // Odstraníme _departmentData z body, aby se nepokoušelo uložit do databáze
    delete body._departmentData

    // Debug log
    console.log('Create member - departmentData:', JSON.stringify(departmentData, null, 2))
    console.log('Create member - permissions:', departmentData?.permissions)

    // Vytvoření správného Supabase klienta podle typu přihlášení
    let supabase: any
    let user: any = null

    // Nejdřív zkontrolujeme, zda je přihlášen přes oddíl (aby se nevyhodila chyba při volání serverSupabaseUser)
    if (departmentData) {
      // Uživatel přihlášen přes oddíl - kontrola práv oddílu
      const hasPermission = departmentData.permissions?.member_management_create === true
      console.log('Create member - hasPermission check:', {
        permissions: departmentData.permissions,
        member_management_create: departmentData.permissions?.member_management_create,
        hasPermission
      })

      if (!hasPermission) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Váš oddíl nemá oprávnění vytvářet členy'
        })
      }

      // Pro operace přes oddíl použijeme service role client (obejde RLS)
      const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Chybí konfigurace Supabase'
        })
      }

      supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
    } else {
      // Zkusíme získat Supabase auth uživatele (může vyhodit chybu, pokud není session)
      try {
        user = await serverSupabaseUser(event)
        supabase = await serverSupabaseClient(event)
      } catch (authError: any) {
        // Pokud není Supabase auth session, vyhodíme chybu
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized'
        })
      }

      if (user) {
        // Uživatel přihlášen přes Supabase auth (admin/editor)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('email', user.email || '')
          .single()

        if (roleError || !roleData) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Nemáte oprávnění vytvářet členy'
          })
        }

        // Admin má vždy oprávnění
        if ((roleData as any).role !== 'admin') {
          // Pro editory kontrolujeme oprávnění member_management.create
          const { data: permissionCheck } = await supabase
            .rpc('check_permission', {
              p_email: user.email || '',
              p_section: 'member_management',
              p_action: 'create'
            } as any)

          if (!permissionCheck) {
            throw createError({
              statusCode: 403,
              statusMessage: 'Nemáte oprávnění vytvářet členy'
            })
          }
        }
      }
    }

    const { department_id, department_ids, full_name, email, phone, street, city, postal_code, full_address, birth_date, birth_place, notes, avatar_url, is_active } = body

    // Podpora pro department_ids (pole) i department_id (zpětná kompatibilita)
    const departmentIds: string[] = department_ids && Array.isArray(department_ids) && department_ids.length > 0
      ? department_ids
      : department_id
        ? [department_id]
        : []

    if (departmentIds.length === 0 || !full_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Alespoň jeden oddíl a jméno jsou povinné'
      })
    }

    // Kontrola, zda všechny oddíly existují
    const { data: departments, error: deptError } = await supabase
      .from('member_departments')
      .select('id')
      .in('id', departmentIds)

    if (deptError || !departments || departments.length !== departmentIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Jeden nebo více oddílů neexistuje'
      })
    }

    // Pro zpětnou kompatibilitu použijeme první oddíl jako department_id
    const primaryDepartmentId = departmentIds[0]

    // Vytvoření člena
    const { data: newMember, error: insertError } = await supabase
      .from('member_users')
      .insert({
        department_id: primaryDepartmentId,
        full_name,
        email: email || null,
        phone: phone || null,
        street: street || null,
        city: city || null,
        postal_code: postal_code || null,
        full_address: full_address || null,
        birth_date: birth_date || null,
        birth_place: birth_place || null,
        notes: notes || null,
        avatar_url: avatar_url || null,
        is_active: is_active ?? true
      } as any)
      .select(`
        *,
        department:member_departments(name, display_name)
      `)
      .single()

    if (insertError || !newMember) {
      throw createError({
        statusCode: 500,
        statusMessage: insertError?.message || 'Nepodařilo se vytvořit člena'
      })
    }

    // Vytvoření vztahů v pomocné tabulce pro všechny oddíly
    if (departmentIds.length > 0 && (newMember as any).id) {
      const departmentRelations = departmentIds.map(deptId => ({
        member_user_id: (newMember as any).id,
        department_id: deptId
      }))

      const { error: relationError } = await supabase
        .from('member_user_departments')
        .insert(departmentRelations as any)

      if (relationError) {
        console.error('Error creating department relations:', relationError)
        // Necháme to projít, protože hlavní záznam už byl vytvořen
      }
    }

    return {
      success: true,
      member: newMember
    }
  } catch (error: any) {
    console.error('Error in create member endpoint:', error)
    throw error
  }
})

