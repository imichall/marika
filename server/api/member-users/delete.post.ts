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

    // Kontrola oprávnění - admin nebo editor s oprávněním member_management.delete
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

    const body = await readBody(event)
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

