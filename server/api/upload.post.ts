import formidable from 'formidable'
import type { Fields, Files } from 'formidable'
import { serverSupabaseClient } from '#supabase/server'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Načteme data přímo z requestu jako buffer
    const body = await readBody(event)
    const buffer = Buffer.from(await body.image.arrayBuffer())
    const originalFilename = body.image.name
    const mimeType = body.image.type

    if (!buffer) {
      throw new Error('Žádný soubor nebyl nahrán')
    }

    const client = await serverSupabaseClient(event)

    const fileName = originalFilename || 'image.jpg'
    const timestamp = Date.now()
    const newFileName = `concert-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

    // Upload do Supabase Storage přímo z bufferu
    const { error: storageError } = await client
      .storage
      .from('concerts')
      .upload(newFileName, buffer, {
        contentType: mimeType || 'image/jpeg',
        cacheControl: '3600'
      })

    if (storageError) {
      console.error('Storage error:', storageError)
      throw storageError
    }

    // Získání veřejné URL
    const { data: publicURL } = client
      .storage
      .from('concerts')
      .getPublicUrl(newFileName)

    return {
      success: true,
      fileName: newFileName,
      path: publicURL.publicUrl
    }
  } catch (err: any) {
    console.error('Error uploading file:', err)
    throw createError({
      statusCode: 500,
      message: err.message || 'Chyba při nahrávání souboru'
    })
  }
})