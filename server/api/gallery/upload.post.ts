import { serverSupabaseClient } from '#supabase/server'
import { readMultipartFormData } from 'h3'

interface GalleryImage {
  id?: number
  image_url: string
  title: string
  created_at: string
}

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw new Error('Žádný soubor nebyl nahrán')
    }

    const savedFiles = []
    const client = await serverSupabaseClient(event)

    for (const file of formData) {
      if (!file.type?.startsWith('image/')) {
        throw new Error('Nepodporovaný formát souboru. Povoleny jsou pouze obrázky.')
      }

      if (!file.data || file.data.length === 0) {
        throw new Error('Prázdný soubor')
      }

      if (file.data.length > 5 * 1024 * 1024) {
        throw new Error('Soubor je příliš velký. Maximální velikost je 5MB.')
      }

      const fileName = file.filename || 'image.jpg'
      const timestamp = Date.now()
      const newFileName = `mansory-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`

      // Upload do Supabase Storage
      const { data: storageData, error: storageError } = await client
        .storage
        .from('gallery')
        .upload(newFileName, file.data, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          duplex: 'half'
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

      const newImage: Omit<GalleryImage, 'id'> = {
        image_url: publicURL.publicUrl,
        title: fileName.split('.')[0],
        created_at: new Date().toISOString()
      }

      // Uložení záznamu do databáze
      const { data: dbData, error: dbError } = await client
        .from('gallery')
        .insert(newImage)
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
    throw createError({
      statusCode: 500,
      message: err.message || 'Nepodařilo se nahrát soubory'
    })
  }
})