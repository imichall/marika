import { serverSupabaseClient } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)
    const { memberEmail, password } = body

    if (!memberEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'E-mail je povinný'
      })
    }

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Heslo je povinné'
      })
    }

    // Najdeme člena podle emailu (napříč všemi oddíly)
    const { data: member, error: memberError } = await supabase
      .from('member_users')
      .select('*')
      .eq('email', memberEmail.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (memberError || !member) {
      console.error('Error fetching member:', memberError)
      throw createError({
        statusCode: 401,
        statusMessage: 'Člen s tímto emailem není registrován nebo není aktivní'
      })
    }

    // Ověření společného hesla
    const { data: verifyResult, error: verifyError } = await supabase
      .rpc('verify_member_common_password', {
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
        statusMessage: 'Neplatné heslo'
      })
    }

    // Získání informací o oddílu člena
    const { data: department, error: deptError } = await supabase
      .from('member_departments')
      .select('*')
      .eq('id', member.department_id)
      .eq('is_active', true)
      .single()

    if (deptError || !department) {
      console.error('Error fetching department:', deptError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Oddíl člena není aktivní nebo neexistuje'
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
        department_id: department.id,
        member_user_id: member.id,
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
      member: member.full_name,
      department: deptData.display_name,
      permissions: finalPermissions
    })

    return {
      success: true,
      department: {
        id: department.id,
        name: department.name,
        display_name: deptData?.display_name || department.name,
        permissions: finalPermissions
      },
      member: {
        id: member.id,
        full_name: member.full_name,
        email: member.email,
        avatar_url: member.avatar_url,
        department_id: member.department_id
      }
    }
  } catch (error: any) {
    console.error('Error in member auth login endpoint:', error)
    throw error
  }
})

