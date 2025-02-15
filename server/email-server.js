import { startEmailServer } from './utils/emailServer.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

console.log('Starting email server...');
console.log('Environment variables:');
console.log('NUXT_PUBLIC_SUPABASE_URL:', process.env.NUXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

try {
    const { supabase, transporter } = await startEmailServer();
    console.log('Email server started successfully');
} catch (error) {
    console.error('Failed to start email server:', error.message);
    process.exit(1);
}
