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
      .single()

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
        })

      if (!permissionCheck) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Nemáte oprávnění vytvářet oddíly'
        })
      }
    }

    const body = await readBody(event)
    const { name, display_name, password, description } = body

    if (!name || !display_name || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Název, zobrazovaný název a heslo jsou povinné'
      })
    }

    // Vytvoření hashe hesla pomocí databázové funkce
    const { data: hashedPassword, error: hashError } = await supabase
      .rpc('hash_department_password', { p_password: password }) as { data: string | null, error: any }

    if (hashError) {
      console.error('Error hashing password:', hashError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Nepodařilo se vytvořit hash hesla'
      })
    }

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
      .single()

    if (insertError) {
      console.error('Error creating department:', insertError)

      if (insertError.code === '23505') { // unique violation
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

    // Uložení nehasheovaného hesla do dočasné tabulky (24 hodin)
    const { error: tempPasswordError } = await supabase
      .from('department_passwords_temp')
      .insert({
        department_id: department.id,
        password: password,
        created_by_email: user.email || '',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hodin
      } as any)

    if (tempPasswordError) {
      console.error('Error saving temp password:', tempPasswordError)
      // Necháme to projít, protože hlavní operace proběhla úspěšně
    }

    return {
      success: true,
      department,
      password: password // Vracíme heslo pro zobrazení (pouze pro oprávněné uživatele)
    }
  } catch (error: any) {
    console.error('Error in create department endpoint:', error)
    throw error
  }
})

