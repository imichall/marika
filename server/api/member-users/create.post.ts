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

    // Kontrola oprávnění - admin nebo editor s oprávněním member_management.create
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

    const body = await readBody(event)
    const { department_id, full_name, email, phone, street, city, postal_code, full_address, birth_date, birth_place, notes, avatar_url, is_active } = body

    if (!department_id || !full_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Oddíl a jméno jsou povinné'
      })
    }

    // Kontrola, zda oddíl existuje
    const { data: department, error: deptError } = await supabase
      .from('member_departments')
      .select('id')
      .eq('id', department_id)
      .single()

    if (deptError || !department) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Oddíl neexistuje'
      })
    }

    // Vytvoření člena
    const { data: newMember, error: insertError } = await supabase
      .from('member_users')
      .insert({
        department_id,
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

    if (insertError) {
      throw createError({
        statusCode: 500,
        statusMessage: insertError.message || 'Nepodařilo se vytvořit člena'
      })
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

