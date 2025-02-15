import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

async function testEmail() {
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase configuration');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
    });

    try {
        console.log('Inserting test testimonial...');
        const { data, error } = await supabase
            .from('form_messages')
            .insert([{
                email: 'test@example.com',
                name: 'Test User',
                message: 'Toto je testovací reference pro ověření emailového systému.',
                is_testimonial: true,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;
        console.log('Test testimonial inserted successfully:', data);

        // Počkáme 5 sekund na zpracování emailu
        console.log('Waiting 5 seconds for email processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Zkontrolujeme stav v email_logs
        const { data: emailLog, error: emailError } = await supabase
            .from('email_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (emailError) throw emailError;
        console.log('Latest email log:', emailLog);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit(0);
    }
}

testEmail();