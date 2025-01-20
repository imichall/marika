import PDFDocument from 'pdfkit';
import fs from 'fs';
import { join } from 'path';

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const { title, date, group, price, desc, image } = body;

        // Vytvoříme PDF dokument
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
            info: {
                Title: title,
                Author: 'Marika',
                Subject: 'Koncertní plakát'
            }
        });

        // Nastavíme název souboru
        const timestamp = Date.now();
        const fileName = `poster-${timestamp}.pdf`;
        const filePath = join(process.cwd(), 'public/posters', fileName);

        // Ujistíme se, že složka existuje
        if (!fs.existsSync(join(process.cwd(), 'public/posters'))) {
            fs.mkdirSync(join(process.cwd(), 'public/posters'), { recursive: true });
        }

        const writeStream = fs.createWriteStream(filePath);

        // Pipe PDF do souboru
        doc.pipe(writeStream);

        // Přidáme logo nebo obrázek koncertu
        if (image && image.startsWith('/')) {
            const imagePath = join(process.cwd(), 'public', image.replace(/^\//, ''));
            if (fs.existsSync(imagePath)) {
                doc.image(imagePath, {
                    fit: [500, 300],
                    align: 'center',
                    valign: 'center'
                });
            }
        }

        // Nadpis
        doc.moveDown(2);
        doc.fontSize(30)
            .font('Helvetica-Bold')
            .text(title, {
                align: 'center'
            });

        // Datum a skupina
        doc.moveDown();
        doc.fontSize(18)
            .font('Helvetica')
            .text(new Date(date).toLocaleDateString('cs-CZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }), {
                align: 'center'
            });

        doc.moveDown(0.5);
        doc.fontSize(16)
            .text(group, {
                align: 'center'
            });

        // Popis
        doc.moveDown(2);
        doc.fontSize(14)
            .text(desc, {
                align: 'left',
                width: 500
            });

        // Cena
        doc.moveDown(2);
        doc.fontSize(16)
            .text(`Vstupné: ${price} Kč`, {
                align: 'center'
            });

        // Patička
        doc.moveDown(4);
        doc.fontSize(12)
            .text('Těšíme se na vaši návštěvu!', {
                align: 'center'
            });

        // Finalizace PDF
        doc.end();

        // Počkáme na dokončení zápisu
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log('PDF generated successfully:', filePath);

        // Vrátíme cestu k vytvořenému PDF
        return {
            success: true,
            path: `/posters/${fileName}`
        };
    } catch (error) {
        console.error('Error generating poster:', error);
        throw createError({
            statusCode: 500,
            message: `Chyba při generování plakátu: ${error.message}`
        });
    }
});