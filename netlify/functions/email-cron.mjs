import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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
                                        <img src="https://dev-marikasingers.netlify.app/images/svg/marika-singers-logo.svg" alt="Marika Singers Logo" style="height: 60px; width: auto" />
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

// Funkce pro zpracování emailu
async function processEmail(supabase, transporter, emailData) {
    console.log('Processing email:', emailData.id);
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

        console.log('Email sent successfully:', emailData.id);
    } catch (sendError) {
        console.error('Error sending email:', emailData.id, sendError);

        // Aktualizace stavu v logu
        await supabase
            .from('email_logs')
            .update({
                status: 'failed',
                error_message: sendError.message
            })
            .eq('id', emailData.id);
    }
}

export default async (req) => {
    const { next_run } = await req.json();
    console.log("Spouštím kontrolu emailů. Další spuštění:", next_run);

    try {
        // Vytvoření Supabase klienta
        const supabase = createClient(
            process.env.NUXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                    detectSessionInUrl: false
                }
            }
        );

        // Vytvoření SMTP transportu pro Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Načtení nevyřízených emailů
        const { data: pendingEmails, error } = await supabase
            .from('email_logs')
            .select('*')
            .eq('status', 'pending');

        if (error) {
            throw error;
        }

        if (pendingEmails?.length > 0) {
            console.log(`Nalezeno ${pendingEmails.length} nevyřízených emailů`);
            for (const email of pendingEmails) {
                await processEmail(supabase, transporter, email);
                // Krátká pauza mezi emaily
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            console.log('Žádné nevyřízené emaily');
        }

        return new Response(JSON.stringify({
            message: 'Email check completed',
            processed: pendingEmails?.length || 0
        }));
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            error: error.message
        }), { status: 500 });
    }
};

// Nastavení scheduled function
export const config = {
    schedule: "*/15 * * * *"  // Každých 15 minut
};