import formidable from 'formidable'
import type { Fields, Files } from 'formidable'
import { serverSupabaseClient } from '#supabase/server'
import { readFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({
      maxFiles: 1,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      filter: (part) => {
        return part.mimetype?.startsWith('image/') || false
      }
    })

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(event.node.req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const uploadedFile = Array.isArray(files.image) ? files.image[0] : files.image
    if (!uploadedFile) {
      throw new Error('Žádný soubor nebyl nahrán')
    }

    const client = await serverSupabaseClient(event)

    const fileName = uploadedFile.originalFilename || 'image.jpg'
    const timestamp = Date.now()
    const newFileName = `concert-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

    // Přečtení obsahu souboru z dočasného umístění
    const fileContent = await readFile(uploadedFile.filepath)

    // Upload do Supabase Storage
    const { error: storageError } = await client
      .storage
      .from('concerts')
      .upload(newFileName, fileContent, {
        contentType: uploadedFile.mimetype || 'image/jpeg',
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