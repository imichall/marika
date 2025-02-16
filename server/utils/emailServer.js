import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Funkce pro vytvoření HTML emailu
function createEmailTemplate(content) {
    const currentYear = new Date().getFullYear();
    return `
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333333;">
            <tbody>
                <tr>
                    <td style="padding: 40px 20px; background-color: #f8f9fa">
                        <!-- Logo -->
                        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-bottom: 30px">
                            <tbody>
                                <tr>
                                    <td align="center">
                                        <img src="https://dev.marikasingers.netlify.app/images/svg/marika-singers-logo.svg" alt="Marika Singers Logo" style="height: 60px; width: auto" />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Content -->
                        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                            <tbody>
                                <tr>
                                    <td style="padding: 30px">
                                        ${content}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Footer -->
                        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin-top: 30px; text-align: center">
                            <tbody>
                                <tr>
                                    <td style="padding: 20px 0; color: #666666; font-size: 14px">
                                        <p style="margin: 0 0 15px 0">
                                            S pozdravem,<br />
                                            Tým Marika Singers
                                        </p>
                                        <div style="margin: 25px 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                                            <p style="margin: 0 0 10px 0">
                                                Sledujte nás na sociálních sítích:
                                            </p>
                                            <p style="margin: 0">
                                                <a href="https://facebook.com/marikasingers" style="color: #4267b2; text-decoration: none; margin: 0 8px;">Facebook</a>
                                                <a href="https://instagram.com/marikasingers" style="color: #e1306c; text-decoration: none; margin: 0 8px;">Instagram</a>
                                            </p>
                                        </div>
                                        <p style="margin: 0; color: #999999; font-size: 12px">
                                            © ${currentYear} Marika Singers. Všechna práva vyhrazena.
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
}

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

    // Vytvoření SMTP transportu pro Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    console.log('Gmail SMTP transport created');

    // Funkce pro zpracování emailu
    const processEmail = async (emailData) => {
        console.log('Processing email:', emailData);
        try {
            const htmlContent = createEmailTemplate(emailData.body.replace(/\n/g, '<br>'));

            // Odeslání emailu
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: emailData.recipient,
                subject: emailData.subject,
                text: emailData.body,
                html: htmlContent
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
            // Přidáme krátkou pauzu mezi odesíláním emailů
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Nastavení Realtime subscriptions pro email_logs
    const subscription = supabase
        .channel('email_notifications')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'email_logs',
            filter: 'status=eq.pending'
        }, async (payload) => {
            console.log('New email notification received:', payload.new.id);
            await processEmail(payload.new);
        })
        .subscribe(async (status, err) => {
            if (err) {
                console.error('Subscription error:', err);
            } else {
                console.log('Subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    // Po úspěšném připojení znovu zkontrolujeme nevyřízené emaily
                    const { data: newPendingEmails } = await supabase
                        .from('email_logs')
                        .select('*')
                        .eq('status', 'pending');

                    if (newPendingEmails?.length > 0) {
                        console.log(`Processing ${newPendingEmails.length} pending emails after subscription`);
                        for (const email of newPendingEmails) {
                            await processEmail(email);
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }
            }
        });

    return { supabase, transporter, subscription };
}

// ... rest of the code ...