import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import formidable from 'formidable'
import type { Fields, Files, File } from 'formidable'

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

    const uploadDir = join(process.cwd(), 'public', 'images', 'mansory')
    await mkdir(uploadDir, { recursive: true })

    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images]
    const savedFiles = []

    for (const file of uploadedFiles) {
      if (!file) continue

      const buffer = await readFileAsBuffer(file)
      const fileName = file.originalFilename || 'image.jpg'
      const timestamp = Date.now()
      const newFileName = `mansory-${timestamp}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`
      const filePath = join(uploadDir, newFileName)

      await writeFile(filePath, buffer)
      savedFiles.push(newFileName)
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

async function readFileAsBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const stream = file.createReadStream()

    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}