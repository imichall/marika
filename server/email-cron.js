import { startEmailServer } from './utils/emailServer.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import cron from 'node-cron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Načtení .env souboru
config({ path: resolve(__dirname, '../.env') });

console.log('Spouštím email cron server...');

let isProcessing = false;

// Funkce pro spuštění email serveru
async function runEmailServer() {
    if (isProcessing) {
        console.log('Předchozí kontrola stále běží, přeskakuji...');
        return;
    }

    isProcessing = true;
    const currentTime = new Date().toLocaleString('cs-CZ');
    console.log(`\n[${currentTime}] Spouštím kontrolu emailů...`);

    try {
        const { supabase } = await startEmailServer();

        // Načteme všechny nevyřízené emaily
        const { data: pendingEmails, error } = await supabase
            .from('email_logs')
            .select('*')
            .eq('status', 'pending');

        if (error) {
            throw error;
        }

        if (pendingEmails?.length > 0) {
            console.log(`[${currentTime}] Nalezeno ${pendingEmails.length} nevyřízených emailů`);
        } else {
            console.log(`[${currentTime}] Žádné nevyřízené emaily`);
        }

        // Počkáme 2 minuty na zpracování a nové notifikace
        await new Promise(resolve => setTimeout(resolve, 120000));

        // Zkontrolujeme, jestli byly všechny emaily zpracovány
        const { data: remainingEmails } = await supabase
            .from('email_logs')
            .select('*')
            .eq('status', 'pending');

        if (remainingEmails?.length > 0) {
            console.log(`[${currentTime}] Zůstalo ${remainingEmails.length} nezpracovaných emailů`);
        } else {
            console.log(`[${currentTime}] Všechny emaily byly úspěšně zpracovány`);
        }

        console.log(`[${currentTime}] Kontrola emailů dokončena`);
    } catch (error) {
        console.error(`[${currentTime}] Chyba při zpracování emailů:`, error.message);
    } finally {
        isProcessing = false;
    }
}

// Spustíme ihned při startu
runEmailServer();

// Nastavíme cron job na každých 15 minut
cron.schedule('*/5 * * * *', runEmailServer);

// Zachytávání chyb pro stabilitu
process.on('uncaughtException', (error) => {
    console.error('Neočekávaná chyba:', error);
    isProcessing = false;
});

process.on('unhandledRejection', (error) => {
    console.error('Neošetřený promise reject:', error);
    isProcessing = false;
});

console.log('Email cron server běží. Kontrola emailů probíhá každých 15 minut.');