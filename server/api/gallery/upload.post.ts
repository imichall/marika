import formidable from 'formidable'
import type { Fields, Files, File } from 'formidable'
import { serverSupabaseClient } from '#supabase/server'
import { readFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  try {
    const form = formidable({
      maxFiles: 10,
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

    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images]
    const savedFiles = []

    const client = await serverSupabaseClient(event)

    for (const file of uploadedFiles) {
      if (!file) continue

      const fileName = file.originalFilename || 'image.jpg'
      const timestamp = Date.now()
      const newFileName = `mansory-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

      // Přečtení obsahu souboru z dočasného umístění
      const fileContent = await readFile(file.filepath)

      // Upload do Supabase Storage
      const { data: storageData, error: storageError } = await client
        .storage
        .from('gallery')
        .upload(newFileName, fileContent, {
          contentType: file.mimetype || 'image/jpeg',
          cacheControl: '3600'
        })

      if (storageError) {
        console.error('Storage error:', storageError)
        throw storageError
      }

      // Získání veřejné URL
      const { data: publicURL } = client
        .storage
        .from('gallery')
        .getPublicUrl(newFileName)

      // Uložení záznamu do databáze
      const { data: dbData, error: dbError } = await client
        .from('gallery')
        .insert([{
          image_url: publicURL.publicUrl,
          title: fileName.split('.')[0], // Použijeme název souboru jako titulek
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      savedFiles.push({
        image_url: publicURL.publicUrl,
        title: fileName.split('.')[0]
      })
    }

    return {
      success: true,
      files: savedFiles
    }
  } catch (err: any) {
    console.error('Error uploading files:', err)
    return {
      success: false,
      error: 'Nepodařilo se nahrát soubory'
    }
  }
})