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
      .single<{
        id: string
        full_name: string
        email: string
        avatar_url: string | null
        department_id: string
      }>()

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
      } as any)

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

    // Získání všech oddílů člena z pomocné tabulky
    const { data: memberDepartments } = await supabase
      .from('member_user_departments')
      .select(`
        department_id,
        department:member_departments(*)
      `)
      .eq('member_user_id', member.id)

    // Pokud nemá oddíly v pomocné tabulce, použijeme hlavní department_id
    let departments: any[] = []
    if (memberDepartments && memberDepartments.length > 0) {
      departments = memberDepartments
        .map((md: any) => md.department)
        .filter((dept: any) => dept && dept.is_active)
    } else if (member.department_id) {
      // Fallback na hlavní department
      const { data: mainDept } = await supabase
        .from('member_departments')
        .select('*')
        .eq('id', member.department_id)
        .eq('is_active', true)
        .single()

      if (mainDept) {
        departments = [mainDept]
      }
    }

    if (departments.length === 0) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Člen nemá přiřazen žádný aktivní oddíl'
      })
    }

    // Pro zpětnou kompatibilitu použijeme první oddíl jako hlavní
    const department: any = departments[0]

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
      } as any)

    if (logError) {
      console.error('Error logging member login:', logError)
      // Nebudeme vyhazovat chybu, jen zalogujeme
    }

    const deptData: any = department
    const finalPermissions = {
      repertoire_view: deptData?.permissions?.repertoire_view ?? true,
      repertoire_edit: deptData?.permissions?.repertoire_edit ?? false,
      member_directory_view: deptData?.permissions?.member_directory_view ?? true,
      members_area_view: deptData?.permissions?.members_area_view ?? true,
      member_resources_view: deptData?.permissions?.member_resources_view ?? true,
      member_resources_upload: deptData?.permissions?.member_resources_upload ?? false,
      member_management_create: deptData?.permissions?.member_management_create ?? false,
      member_management_edit: deptData?.permissions?.member_management_edit ?? false,
      member_management_delete: deptData?.permissions?.member_management_delete ?? false
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
        display_name: department.display_name || department.name,
        permissions: finalPermissions
      },
      departments: departments.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        display_name: dept.display_name || dept.name
      })),
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

