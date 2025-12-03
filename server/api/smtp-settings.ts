import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody, getMethod, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase configuration')
    throw createError({
      statusCode: 500,
      message: 'Chybí konfigurace Supabase'
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // GET - načtení SMTP nastavení
  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('smtp_settings')
        .limit(1)
        .single()

      if (error) {
        console.error('Supabase GET error:', error)
        // Pokud neexistuje záznam, vrátíme výchozí hodnoty
        if (error.code === 'PGRST116') {
          return {
            host: 'smtp.websupport.cz',
            port: 465,
            secure: true,
            user: '',
            from_email: '',
            from_name: 'Marika Singers',
            has_password: false
          }
        }
        throw error
      }

      // Vrátíme nastavení bez hesla pro bezpečnost
      const settings = data?.smtp_settings || {}
      return {
        host: settings.host || 'smtp.websupport.cz',
        port: settings.port || 465,
        secure: settings.secure !== false,
        user: settings.user || '',
        from_email: settings.from_email || '',
        from_name: settings.from_name || 'Marika Singers',
        bcc_email: settings.bcc_email || '',
        // Heslo nevracíme, pouze indikátor zda je nastaveno
        has_password: !!settings.password
      }
    } catch (err: any) {
      console.error('Error fetching SMTP settings:', err)
      throw createError({
        statusCode: 500,
        message: 'Chyba při načítání SMTP nastavení: ' + err.message
      })
    }
  }

  // POST - uložení SMTP nastavení
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      console.log('Saving SMTP settings, received body keys:', Object.keys(body))
      console.log('Saving SMTP settings, body:', {
        host: body.host,
        port: body.port,
        secure: body.secure,
        user: body.user,
        from_email: body.from_email,
        from_name: body.from_name,
        bcc_email: body.bcc_email,
        password: body.password ? '[HIDDEN - ' + body.password.length + ' chars]' : '[EMPTY]'
      })

      // Nejprve načteme existující nastavení
      const { data: existingData, error: fetchError } = await supabase
        .from('settings')
        .select('id, smtp_settings')
        .limit(1)
        .single()

      if (fetchError) {
        console.error('Error fetching existing settings:', fetchError)
      }

      const existingSettings = existingData?.smtp_settings || {}
      const settingsId = existingData?.id

      // Připravíme nová nastavení
      const newSettings: any = {
        host: body.host || 'smtp.websupport.cz',
        port: parseInt(body.port) || 465,
        secure: body.secure !== false,
        user: body.user || '',
        from_email: body.from_email || '',
        from_name: body.from_name || 'Marika Singers',
        bcc_email: body.bcc_email || ''
      }

      // Heslo aktualizujeme pouze pokud bylo posláno
      if (body.password) {
        newSettings.password = body.password
      } else {
        // Zachováme existující heslo
        newSettings.password = existingSettings.password || ''
      }

      console.log('New settings to save:', {
        host: newSettings.host,
        port: newSettings.port,
        secure: newSettings.secure,
        user: newSettings.user,
        from_email: newSettings.from_email,
        from_name: newSettings.from_name,
        bcc_email: newSettings.bcc_email,
        password: newSettings.password ? '[SET - ' + newSettings.password.length + ' chars]' : '[EMPTY]'
      })
      console.log('Updating settings with id:', settingsId)

      let error
      if (settingsId) {
        // Aktualizujeme existující záznam
        const result = await supabase
          .from('settings')
          .update({ smtp_settings: newSettings })
          .eq('id', settingsId)
        error = result.error
      } else {
        // Vytvoříme nový záznam pokud neexistuje
        const result = await supabase
          .from('settings')
          .insert({ smtp_settings: newSettings })
        error = result.error
      }

      if (error) {
        console.error('Supabase update/insert error:', error)
        throw error
      }

      return {
        success: true,
        message: 'SMTP nastavení bylo úspěšně uloženo'
      }
    } catch (err: any) {
      console.error('Error saving SMTP settings:', err)
      throw createError({
        statusCode: 500,
        message: 'Chyba při ukládání SMTP nastavení: ' + err.message
      })
    }
  }

  throw createError({
    statusCode: 405,
    message: 'Method not allowed'
  })
})

