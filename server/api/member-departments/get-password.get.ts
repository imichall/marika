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

    const query = getQuery(event)
    const departmentId = query.departmentId as string

    if (!departmentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID oddílu je povinné'
      })
    }

    // Kontrola oprávnění - admin nebo editor s oprávněním password_view
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('email', user.email || '')
      .single()

    if (roleError || !roleData) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění zobrazit heslo oddílu'
      })
    }

    let hasPermission = false

    // Admin má vždy oprávnění
    if (roleData.role === 'admin') {
      hasPermission = true
    } else {
      // Pro editory kontrolujeme oprávnění password_view
      const { data: permissionCheck } = await supabase
        .rpc('check_permission', {
          p_email: user.email || '',
          p_section: 'member_departments',
          p_action: 'password_view'
        })

      hasPermission = permissionCheck || false
    }

    // Získání hesla z dočasné tabulky
    const { data: tempPassword, error: tempPasswordError } = await supabase
      .from('department_passwords_temp')
      .select('password, created_by_email, expires_at')
      .eq('department_id', departmentId)
      .gt('expires_at', new Date().toISOString()) // Pouze neexpirovaná hesla
      .single()

    if (tempPasswordError || !tempPassword) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Heslo není k dispozici nebo vypršelo'
      })
    }

    // Kontrola, zda uživatel má oprávnění nebo vytvořil heslo
    if (!hasPermission && tempPassword.created_by_email !== user.email) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění zobrazit toto heslo'
      })
    }

    return {
      success: true,
      password: tempPassword.password,
      expires_at: tempPassword.expires_at
    }
  } catch (error: any) {
    console.error('Error in get department password endpoint:', error)
    throw error
  }
})

