import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Kontrola oprávnění - admin nebo editor s oprávněním member_management.edit
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

    const body = await readBody(event)
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
    if (department_ids !== undefined && Array.isArray(department_ids)) {
      departmentIds = department_ids
    } else if (department_id !== undefined) {
      departmentIds = [department_id]
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
      .update(updateData as any)
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
    if (departmentIds !== undefined) {
      // Smazání starých vztahů
      const { error: deleteError } = await supabase
        .from('member_user_departments')
        .delete()
        .eq('member_user_id', id)

      if (deleteError) {
        console.error('Error deleting old department relations:', deleteError)
      }

      // Vytvoření nových vztahů
      if (departmentIds.length > 0) {
        const departmentRelations = departmentIds.map(deptId => ({
          member_user_id: id,
          department_id: deptId
        }))

        const { error: relationError } = await supabase
          .from('member_user_departments')
          .insert(departmentRelations)

        if (relationError) {
          console.error('Error creating department relations:', relationError)
        }
      }
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

