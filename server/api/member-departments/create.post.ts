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

    // Kontrola, zda je uživatel admin
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('email', user.email || '')
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Pouze administrátoři mohou vytvářet oddíly'
      })
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

    return {
      success: true,
      department
    }
  } catch (error: any) {
    console.error('Error in create department endpoint:', error)
    throw error
  }
})

