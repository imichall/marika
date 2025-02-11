import { serverSupabaseClient } from '#supabase/server'
import { readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || !formData[0]) {
      throw new Error('Žádný soubor nebyl nahrán')
    }

    const file = formData[0]
    const buffer = file.data
    const originalFilename = file.filename
    const mimeType = file.type

    if (!buffer || buffer.length === 0) {
      throw new Error('Prázdný soubor')
    }

    if (!mimeType?.startsWith('image/')) {
      throw new Error('Nepodporovaný formát souboru. Povoleny jsou pouze obrázky.')
    }

    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Soubor je příliš velký. Maximální velikost je 5MB.')
    }

    const client = await serverSupabaseClient(event)

    const fileName = originalFilename || 'image.jpg'
    const timestamp = Date.now()
    const newFileName = `concert-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

    const { error: storageError } = await client
      .storage
      .from('concerts')
      .upload(newFileName, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        duplex: 'half'
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      throw storageError
    }

    const { data: publicURL } = client
      .storage
      .from('concerts')
      .getPublicUrl(newFileName)

    return {
      success: true,
      fileName: newFileName,
      path: publicURL.publicUrl,
      size: buffer.length,
      type: mimeType
    }
  } catch (err: any) {
    console.error('Error uploading file:', err)
    throw createError({
      statusCode: 500,
      message: err.message || 'Chyba při nahrávání souboru'
    })
  }
})