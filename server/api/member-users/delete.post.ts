import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { H3Event, createError } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)

    // Získání informací o oddílu z body (pokud je přihlášen přes oddíl)
    const departmentData = body._departmentData || null
    // Odstraníme _departmentData z body
    delete body._departmentData

    // Vytvoření správného Supabase klienta podle typu přihlášení
    let supabase: any
    let user: any = null

    // Nejdřív zkontrolujeme, zda je přihlášen přes oddíl (aby se nevyhodila chyba při volání serverSupabaseUser)
    if (departmentData) {
      // Uživatel přihlášen přes oddíl - kontrola práv oddílu
      if (!departmentData.permissions?.member_management_delete) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Váš oddíl nemá oprávnění mazat členy'
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
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('email', user.email || '')
          .single()

        if (roleError || !roleData) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Nemáte oprávnění mazat členy'
          })
        }

        // Admin má vždy oprávnění
        if ((roleData as any).role !== 'admin') {
          // Pro editory kontrolujeme oprávnění member_management.delete
          const { data: permissionCheck } = await supabase
            .rpc('check_permission', {
              p_email: user.email || '',
              p_section: 'member_management',
              p_action: 'delete'
            } as any)

          if (!permissionCheck) {
            throw createError({
              statusCode: 403,
              statusMessage: 'Nemáte oprávnění mazat členy'
            })
          }
        }
      }
    }

    const { id } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID člena je povinné'
      })
    }

    // Kontrola, zda člen existuje
    const { data: existingMember, error: memberError } = await supabase
      .from('member_users')
      .select('id, full_name')
      .eq('id', id)
      .single()

    if (memberError || !existingMember) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Člen neexistuje'
      })
    }

    // Smazání člena
    const { error: deleteError } = await supabase
      .from('member_users')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw createError({
        statusCode: 500,
        statusMessage: deleteError.message || 'Nepodařilo se smazat člena'
      })
    }

    return {
      success: true,
      message: 'Člen byl úspěšně smazán'
    }
  } catch (error: any) {
    console.error('Error in delete member endpoint:', error)
    throw error
  }
})

