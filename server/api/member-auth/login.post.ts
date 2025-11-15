import { serverSupabaseClient } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)
    const { departmentName, memberEmail, password } = body

    if (!departmentName || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Název oddílu a heslo jsou povinné'
      })
    }

    if (!memberEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'E-mail člena je povinný'
      })
    }

    // Ověření hesla oddílu
    const { data: verifyResult, error: verifyError } = await supabase
      .rpc('verify_department_password', {
        p_department_name: departmentName,
        p_password: password
      })

    if (verifyError) {
      console.error('Error verifying password:', verifyError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Chyba při ověřování hesla'
      })
    }

    // verifyResult je pole s jedním objektem
    const result: any = Array.isArray(verifyResult) ? verifyResult[0] : verifyResult

    if (!result?.success) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Neplatný oddíl nebo heslo'
      })
    }

    // Získání informací o oddílu
    const { data: department, error: deptError } = await supabase
      .from('member_departments')
      .select('*')
      .eq('id', result.department_id)
      .single()

    if (deptError) {
      console.error('Error fetching department:', deptError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Chyba při načítání informací o oddílu'
      })
    }

    // Ověření, že člen s daným emailem existuje v tomto oddílu
    const { data: member, error: memberError } = await supabase
      .from('member_users')
      .select('*')
      .eq('department_id', result.department_id)
      .eq('email', memberEmail.toLowerCase().trim())
      .single()

    if (memberError || !member) {
      console.error('Error fetching member:', memberError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Člen s tímto emailem není v tomto oddílu registrován'
      })
    }

    const memberData: any = member

    if (!memberData.is_active) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Tento účet není aktivní'
      })
    }

    // Získání IP adresy a user agent
    const headers = getHeaders(event)
    const ipAddress = headers['x-forwarded-for']?.split(',')[0] || headers['x-real-ip'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    // Zaznamenání přihlášení s konkrétním členem
    const { error: logError } = await supabase
      .from('member_login_logs')
      .insert({
        department_id: result.department_id,
        member_user_id: memberData.id,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (logError) {
      console.error('Error logging member login:', logError)
      // Nebudeme vyhazovat chybu, jen zalogujeme
    }

    const deptData: any = department
    const finalPermissions = deptData?.permissions || {
      repertoire_view: true,
      repertoire_edit: false,
      member_directory_view: true,
      members_area_view: true,
      member_resources_view: true,
      member_resources_upload: false
    }

    console.log('Member login successful:', {
      member: memberData.full_name,
      department: deptData.display_name,
      permissions: finalPermissions
    })

    return {
      success: true,
      department: {
        id: result.department_id,
        name: result.department_name,
        display_name: deptData?.display_name || result.department_name,
        permissions: finalPermissions
      },
      member: {
        id: memberData.id,
        full_name: memberData.full_name,
        email: memberData.email,
        avatar_url: memberData.avatar_url,
        department_id: memberData.department_id
      }
    }
  } catch (error: any) {
    console.error('Error in member auth login endpoint:', error)
    throw error
  }
})

