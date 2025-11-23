import { serverSupabaseClient } from '#supabase/server'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const body = await readBody(event)
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Současné i nové heslo jsou povinné'
      })
    }

    if (newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nové heslo musí mít alespoň 6 znaků'
      })
    }

    // Ověřit současné heslo
    const { data: verifyResult, error: verifyError } = await supabase
      .rpc('verify_member_common_password', {
        p_password: currentPassword
      })

    if (verifyError) {
      console.error('Error verifying current password:', verifyError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Chyba při ověřování hesla'
      })
    }

    const result: any = Array.isArray(verifyResult) ? verifyResult[0] : verifyResult

    if (!result?.success) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Neplatné současné heslo'
      })
    }

    // Nastavit nové heslo
    console.log('Attempting to set new password...')
    const { data: setData, error: setError } = await supabase
      .rpc('set_member_common_password', {
        p_password: newPassword
      })

    console.log('Set password result:', { data: setData, error: setError })

    if (setError) {
      console.error('Error setting new password:', setError)
      console.error('Error details:', JSON.stringify(setError, null, 2))
      throw createError({
        statusCode: 500,
        statusMessage: `Chyba při nastavování nového hesla: ${setError.message || setError.code || 'Unknown error'}`
      })
    }

    // Získání IP adresy a user agent
    const headers = getHeaders(event)
    const ipAddress = headers['x-forwarded-for']?.split(',')[0] || headers['x-real-ip'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    // Zaznamenat změnu hesla do audit logu
    const user = await supabase.auth.getUser()
    if (user.data?.user?.email) {
      await supabase.from('audit_logs').insert({
        action: 'update_member_common_password',
        table_name: 'settings',
        record_id: null,
        user_email: user.data.user.email,
        changes: { message: 'Změna společného hesla do členské sekce' },
        ip_address: ipAddress
      })
    }

    return {
      success: true,
      message: 'Heslo bylo úspěšně změněno'
    }
  } catch (error: any) {
    console.error('Error in update common password endpoint:', error)
    throw error
  }
})

