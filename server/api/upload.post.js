import { writeFile } from 'fs/promises';
import { join } from 'path';
import formidable from 'formidable';

export default defineEventHandler(async (event) => {
    const form = formidable({
        uploadDir: join(process.cwd(), 'public/images/concerts'),
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    try {
        const [fields, files] = await form.parse(event.req);
        const file = files.image[0];

        if (!file) {
            throw new Error('Žádný soubor nebyl nahrán');
        }

        // Získáme název souboru z cesty
        const fileName = file.newFilename;
        const publicPath = `/images/concerts/${fileName}`;

        return {
            success: true,
            fileName: fileName,
            path: publicPath
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw createError({
            statusCode: 500,
            message: `Chyba při nahrávání: ${error.message}`
        });
    }
});