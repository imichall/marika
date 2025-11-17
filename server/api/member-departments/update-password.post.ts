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

    // Kontrola oprávnění - admin nebo editor s oprávněním member_departments.edit
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id, role')
      .eq('email', user.email || '')
      .single()

    if (roleError || !roleData) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění měnit hesla oddílů'
      })
    }

    // Admin má vždy oprávnění
    if (roleData.role !== 'admin') {
      // Pro editory kontrolujeme oprávnění member_departments.edit
      const { data: permissionCheck } = await supabase
        .rpc('check_permission', {
          p_email: user.email || '',
          p_section: 'member_departments',
          p_action: 'edit'
        })

      if (!permissionCheck) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Nemáte oprávnění měnit hesla oddílů'
        })
      }
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

    // Uložení nehasheovaného hesla do dočasné tabulky (24 hodin)
    const { error: tempPasswordError } = await supabase
      .from('department_passwords_temp')
      .upsert({
        department_id: departmentId,
        password: newPassword,
        created_by_email: user.email || '',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hodin
      } as any, {
        onConflict: 'department_id'
      })

    if (tempPasswordError) {
      console.error('Error saving temp password:', tempPasswordError)
      // Necháme to projít, protože hlavní operace proběhla úspěšně
    }

    return {
      success: true,
      message: 'Heslo oddílu bylo úspěšně změněno',
      password: newPassword // Vracíme heslo pro zobrazení (pouze pro oprávněné uživatele)
    }
  } catch (error: any) {
    console.error('Error in update department password endpoint:', error)
    throw error
  }
})

