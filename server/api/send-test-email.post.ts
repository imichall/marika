import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody, createError } from 'h3'
import nodemailer from 'nodemailer'

// Funkce pro vytvoření HTML emailu
function createEmailTemplate(content: string) {
  const currentYear = new Date().getFullYear()
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
                    <img src="https://marikasingers.cz/images/svg/marika-singers-logo.svg" alt="Marika Singers Logo" style="height: 60px; width: auto" />
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
  `
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { to, subject, content } = body

    if (!to || !subject || !content) {
      throw createError({
        statusCode: 400,
        message: 'Chybí povinné parametry: to, subject, content'
      })
    }

    const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        message: 'Chybí konfigurace Supabase'
      })
    }

    // Načtení SMTP nastavení z databáze
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data, error } = await supabase
      .from('settings')
      .select('smtp_settings')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching SMTP settings:', error)
      throw createError({
        statusCode: 500,
        message: 'Nepodařilo se načíst SMTP nastavení z databáze'
      })
    }

    console.log('SMTP settings from DB:', data?.smtp_settings ? {
      host: data.smtp_settings.host,
      port: data.smtp_settings.port,
      user: data.smtp_settings.user,
      hasPassword: !!data.smtp_settings.password
    } : 'No settings found')

    const smtpSettings = data?.smtp_settings

    if (!smtpSettings?.user || !smtpSettings?.password) {
      throw createError({
        statusCode: 400,
        message: `SMTP nastavení není kompletní. User: ${smtpSettings?.user ? 'OK' : 'chybí'}, Password: ${smtpSettings?.password ? 'OK' : 'chybí'}. Prosím nejprve uložte nastavení s heslem.`
      })
    }

    // Vytvoření SMTP transportu
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host || 'smtp.websupport.cz',
      port: smtpSettings.port || 465,
      secure: smtpSettings.secure !== false, // true pro port 465
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password
      }
    })

    // Příprava HTML obsahu
    const htmlContent = createEmailTemplate(content.replace(/\n/g, '<br>'))

    // Odeslání emailu
    const fromAddress = smtpSettings.from_email || smtpSettings.user
    const fromName = smtpSettings.from_name || 'Marika Singers'

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: to,
      subject: subject,
      text: content,
      html: htmlContent
    })

    // Zalogování do email_logs
    await supabase
      .from('email_logs')
      .insert({
        recipient: to,
        subject: subject,
        body: content,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    return {
      success: true,
      message: `Testovací email byl úspěšně odeslán na ${to}`
    }
  } catch (err: any) {
    console.error('Error sending test email:', err)

    // Pokud je to chyba při odesílání, zalogujeme ji
    if (err.code === 'EAUTH' || err.code === 'ESOCKET' || err.responseCode) {
      throw createError({
        statusCode: 500,
        message: `Chyba při odesílání emailu: ${err.message}`
      })
    }

    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || 'Chyba při odesílání testovacího emailu'
    })
  }
})

