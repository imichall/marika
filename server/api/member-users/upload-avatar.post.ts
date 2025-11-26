import { H3Event, createError, readMultipartFormData } from 'h3'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Načtení multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Žádný soubor nebyl nahrán'
      })
    }

    // Získání memberId a _departmentData z form data
    let memberId: string | null = null
    let departmentData: any = null

    for (const field of formData) {
      if (field.name === 'memberId' && field.data) {
        memberId = field.data.toString()
      } else if (field.name === '_departmentData' && field.data) {
        try {
          departmentData = JSON.parse(field.data.toString())
        } catch (e) {
          console.error('Error parsing _departmentData:', e)
        }
      }
    }

    if (!memberId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID člena je povinné'
      })
    }

    // Kontrola oprávnění - buď admin/editor NEBO přihlášen přes oddíl s oprávněním
    // Pro nahrávání avatara stačí mít oprávnění edit nebo create
    let hasPermission = false

    if (departmentData) {
      // Uživatel přihlášen přes oddíl - kontrola práv oddílu
      hasPermission = departmentData.permissions?.member_management_create === true ||
                     departmentData.permissions?.member_management_edit === true
    } else {
      // Zkusíme získat Supabase auth uživatele
      const { serverSupabaseUser } = await import('#supabase/server')
      try {
        const user = await serverSupabaseUser(event)
        if (user) {
          const { serverSupabaseClient } = await import('#supabase/server')
          const supabase = await serverSupabaseClient(event)

          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('email', user.email || '')
            .single<{ role: string }>()

          if (roleData && (roleData.role === 'admin' || roleData.role === 'editor')) {
            hasPermission = true
          }
        }
      } catch (authError) {
        // Není Supabase auth session
      }
    }

    if (!hasPermission) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Nemáte oprávnění nahrávat avatary'
      })
    }

    // Najít soubor v multipart form data
    const file = formData.find(f => f.name === 'avatar')
    if (!file || !file.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Soubor nebyl nalezen'
      })
    }

    // Povolené mime types včetně SVG
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ]

    if (!file.type || !allowedMimeTypes.includes(file.type)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nepodporovaný formát souboru. Povoleny jsou pouze obrázky (JPG, PNG, GIF, WEBP, SVG).'
      })
    }

    if (file.data.length > 5 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Soubor je příliš velký. Maximální velikost je 5MB.'
      })
    }

    // Vytvoření service role client pro nahrávání (obejde RLS)
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Chybí konfigurace Supabase'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Nahrání souboru
    const fileExt = file.filename?.split('.').pop() || 'jpg'
    const fileName = `${memberId}-${Date.now()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('member-avatars')
      .upload(filePath, file.data, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/jpeg'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: uploadError.message || 'Nepodařilo se nahrát soubor'
      })
    }

    // Získání veřejné URL
    const { data: { publicUrl } } = supabase.storage
      .from('member-avatars')
      .getPublicUrl(filePath)

    return {
      success: true,
      avatar_url: publicUrl
    }
  } catch (error: any) {
    console.error('Error in upload avatar endpoint:', error)
    throw error
  }
})

