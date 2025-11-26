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

    // Vytvoření správného Supabase klienta podle typu přihlášení
    let supabase: any
    let user: any = null

    // Nejdřív zkontrolujeme, zda je přihlášen přes oddíl (aby se nevyhodila chyba při volání serverSupabaseUser)
    if (departmentData) {
      // Uživatel přihlášen přes oddíl - kontrola práv oddílu
      if (!departmentData.permissions?.member_management_edit) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Váš oddíl nemá oprávnění upravovat členy'
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
            statusMessage: 'Nemáte oprávnění upravovat členy'
          })
        }

        // Admin má vždy oprávnění
        if ((roleData as any).role !== 'admin') {
          // Pro editory kontrolujeme oprávnění member_management.edit
          const { data: permissionCheck } = await supabase
            .rpc('check_permission', {
              p_email: user.email || '',
              p_section: 'member_management',
              p_action: 'edit'
            } as any)

          if (!permissionCheck) {
            throw createError({
              statusCode: 403,
              statusMessage: 'Nemáte oprávnění upravovat členy'
            })
          }
        }
      }
    }

    const { id, full_name, email, phone, street, city, postal_code, full_address, birth_date, birth_place, notes, avatar_url, is_active, department_id, department_ids } = body

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID člena je povinné'
      })
    }

    // Kontrola, zda člen existuje
    const { data: existingMember, error: memberError } = await supabase
      .from('member_users')
      .select('id')
      .eq('id', id)
      .single()

    if (memberError || !existingMember) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Člen neexistuje'
      })
    }

    // Podpora pro department_ids (pole) i department_id (zpětná kompatibilita)
    let departmentIds: string[] | undefined = undefined
    console.log('Parsing department_ids:', {
      department_ids,
      department_id,
      department_ids_type: typeof department_ids,
      department_ids_is_array: Array.isArray(department_ids)
    })

    if (department_ids !== undefined && Array.isArray(department_ids)) {
      departmentIds = department_ids
      console.log('Using department_ids array:', departmentIds)
    } else if (department_id !== undefined) {
      departmentIds = [department_id]
      console.log('Using department_id (legacy):', departmentIds)
    } else {
      console.log('No department_ids or department_id provided')
    }

    // Pokud se mění oddíly, zkontrolujeme, zda existují
    if (departmentIds !== undefined && departmentIds.length > 0) {
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
    }

    // Příprava dat pro aktualizaci (pouze zadaná pole)
    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (email !== undefined) updateData.email = email || null
    if (phone !== undefined) updateData.phone = phone || null
    if (street !== undefined) updateData.street = street || null
    if (city !== undefined) updateData.city = city || null
    if (postal_code !== undefined) updateData.postal_code = postal_code || null
    if (full_address !== undefined) updateData.full_address = full_address || null
    if (birth_date !== undefined) updateData.birth_date = birth_date || null
    if (birth_place !== undefined) updateData.birth_place = birth_place || null
    if (notes !== undefined) updateData.notes = notes || null
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null
    if (is_active !== undefined) updateData.is_active = is_active

    // Pro zpětnou kompatibilitu nastavíme první oddíl jako department_id
    if (departmentIds !== undefined && departmentIds.length > 0) {
      updateData.department_id = departmentIds[0]
    } else if (department_id !== undefined) {
      updateData.department_id = department_id
    }

    // Aktualizace člena
    const { data: updatedMember, error: updateError } = await supabase
      .from('member_users')
      .update(updateData as any as never)
      .eq('id', id)
      .select(`
        *,
        department:member_departments(name, display_name)
      `)
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: updateError.message || 'Nepodařilo se aktualizovat člena'
      })
    }

    // Aktualizace vztahů v pomocné tabulce, pokud byly změněny oddíly
    // Vždy aktualizujeme vztahy, i když je departmentIds prázdné pole (pro případ odebrání všech oddílů)
    console.log('Updating department relations for member:', id, 'with departmentIds:', departmentIds)

    // Smazání starých vztahů
    const { error: deleteError } = await supabase
      .from('member_user_departments')
      .delete()
      .eq('member_user_id', id)

    if (deleteError) {
      console.error('Error deleting old department relations:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: deleteError.message || 'Nepodařilo se smazat staré vztahy oddílů'
      })
    }

    // Vytvoření nových vztahů (i když je pole prázdné, prostě nevytvoříme žádné)
    if (departmentIds && departmentIds.length > 0) {
      const departmentRelations = departmentIds.map(deptId => ({
        member_user_id: id,
        department_id: deptId
      }))

      console.log('Inserting department relations:', departmentRelations)

      const { error: relationError } = await supabase
        .from('member_user_departments')
        .insert(departmentRelations as any)

      if (relationError) {
        console.error('Error creating department relations:', relationError)
        throw createError({
          statusCode: 500,
          statusMessage: relationError.message || 'Nepodařilo se vytvořit nové vztahy oddílů'
        })
      }

      console.log('Successfully updated department relations')
    } else {
      console.log('No departments to insert (empty array or undefined)')
    }

    return {
      success: true,
      member: updatedMember
    }
  } catch (error: any) {
    console.error('Error in update member endpoint:', error)
    throw error
  }
})

