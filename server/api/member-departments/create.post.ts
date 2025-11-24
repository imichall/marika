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

    // Kontrola oprávnění - admin nebo editor s oprávněním member_departments.create
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('email', user.email || '')
      .single() as { data: { id: string, role: string } | null, error: any }

    if (roleError || !roleData) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění vytvářet oddíly'
      })
    }

    // Admin má vždy oprávnění
    if (roleData.role !== 'admin') {
      // Pro editory kontrolujeme oprávnění member_departments.create
      const { data: permissionCheck } = await supabase
        .rpc('check_permission', {
          p_email: user.email || '',
          p_section: 'member_departments',
          p_action: 'create'
        } as any) as { data: boolean | null }

      if (!permissionCheck) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Nemáte oprávnění vytvářet oddíly'
        })
      }
    }

    const body = await readBody(event)
    console.log('Received body:', JSON.stringify(body, null, 2))

    // Kontrola, že body je objekt
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tělo požadavku musí být objekt'
      })
    }

    const { name, display_name, description } = body

    // Validace povinných polí
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Název (name) je povinný a musí být neprázdný řetězec'
      })
    }

    if (!display_name || typeof display_name !== 'string' || display_name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Zobrazovaný název (display_name) je povinný a musí být neprázdný řetězec'
      })
    }

    // Získání hashe společného hesla z settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('member_common_password_hash')
      .limit(1)
      .single() as { data: { member_common_password_hash: string | null } | null, error: any }

    if (settingsError || !settingsData) {
      console.error('Error fetching settings:', settingsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Nepodařilo se načíst nastavení systému'
      })
    }

    if (!settingsData.member_common_password_hash) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Společné heslo není nastaveno. Prosím nastavte ho nejdříve v nastavení.'
      })
    }

    // Použijeme hash společného hesla pro nový oddíl
    const hashedPassword = settingsData.member_common_password_hash

    // Vytvoření oddílu
    const { data: department, error: insertError } = await supabase
      .from('member_departments')
      .insert({
        name,
        display_name,
        password_hash: hashedPassword,
        description: description || null,
        is_active: true
      } as any)
      .select()
      .single() as { data: { id: string } | null, error: any }

    if (insertError || !department) {
      console.error('Error creating department:', insertError)

      if (insertError?.code === '23505') { // unique violation
        throw createError({
          statusCode: 409,
          statusMessage: 'Oddíl s tímto názvem již existuje'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Nepodařilo se vytvořit oddíl'
      })
    }

    return {
      success: true,
      department
    }
  } catch (error: any) {
    console.error('Error in create department endpoint:', error)
    throw error
  }
})

