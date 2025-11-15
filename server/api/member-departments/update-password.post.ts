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
        statusMessage: 'Pouze administrátoři mohou měnit hesla oddílů'
      })
    }

    const body = await readBody(event)
    const { departmentId, newPassword } = body

    if (!departmentId || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID oddílu a nové heslo jsou povinné'
      })
    }

    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Heslo musí mít alespoň 6 znaků'
      })
    }

    // Vytvoření hashe nového hesla
    const { data: hashedPassword, error: hashError } = await supabase
      .rpc('hash_department_password', { p_password: newPassword }) as { data: string | null, error: any }

    if (hashError) {
      console.error('Error hashing password:', hashError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Nepodařilo se vytvořit hash hesla'
      })
    }

    // Aktualizace hesla oddílu
    const { error: updateError } = await supabase
      .from('member_departments')
      .update({ password_hash: hashedPassword } as any)
      .eq('id', departmentId)

    if (updateError) {
      console.error('Error updating department password:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Nepodařilo se aktualizovat heslo oddílu'
      })
    }

    return {
      success: true,
      message: 'Heslo oddílu bylo úspěšně změněno'
    }
  } catch (error: any) {
    console.error('Error in update department password endpoint:', error)
    throw error
  }
})

