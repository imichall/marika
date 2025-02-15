import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export async function startEmailServer() {
    console.log('Initializing email server...');

    // Vytvoření Supabase klienta
    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Supabase configuration:');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Set' : 'Not set');

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing required environment variables:');
        console.error('NUXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
        console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Set' : 'Not set');
        throw new Error('Missing Supabase configuration');
    }

    // Vytvoření Supabase klienta s explicitní konfigurací
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        }
    });

    // Ověření připojení
    console.log('Verifying Supabase connection...');
    const verifyConnection = async () => {
        try {
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .limit(1);

            if (error) {
                console.error('Connection error:', error);
                return false;
            }

            console.log('Connection successful');
            return true;
        } catch (err) {
            console.error('Error verifying connection:', err);
            return false;
        }
    };

    // Voláme ověření před vytvořením SMTP transportu
    const connectionValid = await verifyConnection();
    if (!connectionValid) {
        throw new Error('Failed to verify Supabase connection. Check your credentials and try again.');
    }

    // Vytvoření testovacího SMTP transportu
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'bfebzof6qw2abmsq@ethereal.email',
            pass: 'Qe3QhCQkFrDsXb4jfW'
        }
    });

    console.log('SMTP transport created');

    // Funkce pro zpracování emailu
    const processEmail = async (emailData) => {
        console.log('Processing email:', emailData);
        try {
            // Odeslání emailu
            await transporter.sendMail({
                from: 'info@marikasingers.cz',
                to: emailData.recipient,
                subject: emailData.subject,
                text: emailData.body,
                html: emailData.body.replace(/\n/g, '<br>')
            });

            // Aktualizace stavu v logu
            await supabase
                .from('email_logs')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString()
                })
                .eq('id', emailData.id);

            console.log('Email sent successfully');
        } catch (sendError) {
            console.error('Error sending email:', sendError);

            // Aktualizace stavu v logu
            await supabase
                .from('email_logs')
                .update({
                    status: 'failed',
                    error_message: sendError.message
                })
                .eq('id', emailData.id);
        }
    };

    // Zpracování existujících nevyřízených emailů
    const { data: pendingEmails, error: pendingError } = await supabase
        .from('email_logs')
        .select('*')
        .eq('status', 'pending');

    if (pendingError) {
        console.error('Error fetching pending emails:', pendingError);
    } else if (pendingEmails?.length > 0) {
        console.log(`Found ${pendingEmails.length} pending emails`);
        for (const email of pendingEmails) {
            await processEmail(email);
        }
    }

    // Nastavení Realtime subscriptions pro email_logs
    const subscription = supabase
        .channel('email_notifications')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'email_logs',
            filter: 'status=eq.pending'
        }, async (payload) => {
            if (payload.eventType === 'INSERT') {
                console.log('New email notification:', payload);
                await processEmail(payload.new);
            }
        })
        .subscribe((status, err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log('Subscription status:', status);
            }
        });

    console.log('Subscribed to email notifications');

    return { supabase, transporter, subscription };
}

// ... rest of the code ...