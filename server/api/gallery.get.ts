import { readdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    const publicPath = join(process.cwd(), 'public', 'images', 'mansory')
    const files = await readdir(publicPath)

    // Filtrujeme jen obrazové soubory a seřadíme podle názvu
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort((a, b) => {
        // Extrahujeme čísla z názvů souborů pro správné řazení
        const numA = parseInt(a.match(/\d+/)?.[0] || '0')
        const numB = parseInt(b.match(/\d+/)?.[0] || '0')
        return numA - numB
      })

    return {
      success: true,
      images
    }
  } catch (err: any) {
    console.error('Error reading gallery directory:', err)
    return {
      success: false,
      error: 'Nepodařilo se načíst galerii'
    }
  }
})