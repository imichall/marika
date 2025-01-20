import { unlink } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const image = event.context.params?.image
    if (!image) {
      return {
        success: false,
        error: 'Chybí název obrázku'
      }
    }

    // Kontrola, že název souboru obsahuje pouze povolené znaky
    if (!/^[a-zA-Z0-9-_.]+\.(jpg|jpeg|png|webp)$/i.test(image)) {
      return {
        success: false,
        error: 'Neplatný název souboru'
      }
    }

    const filePath = join(process.cwd(), 'public', 'images', 'mansory', image)
    await unlink(filePath)

    return {
      success: true
    }
  } catch (err: any) {
    console.error('Error deleting image:', err)
    return {
      success: false,
      error: 'Nepodařilo se smazat obrázek'
    }
  }
})