import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, readBody, createError } from 'h3'
import nodemailer from 'nodemailer'

// Funkce pro vytvoření HTML emailu s rekapitulací objednávky
function createOrderConfirmationEmail(data: {
  customerName: string
  concertTitle: string
  concertDate: string
  concertTime: string
  ticketCount: number
  unitPrice: number
  totalPrice: number
  accountNumber: string
  bankCode: string
  variableSymbol: string
  paymentMessage: string
}) {
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
                    <h1 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">Potvrzení objednávky</h1>

                    <p style="margin: 0 0 20px 0; color: #666666;">
                      Dobrý den, ${data.customerName},<br><br>
                      děkujeme za Vaši objednávku vstupenek na koncert <strong>${data.concertTitle}</strong>.
                    </p>

                    <!-- Rekapitulace koncertu -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                      <tbody>
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="color: #333333; font-size: 16px; margin: 0 0 15px 0;">Detaily koncertu</h2>
                            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                              <tr>
                                <td style="padding: 5px 0; color: #666666;">Název:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${data.concertTitle}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666;">Datum:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${data.concertDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666;">Čas:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${data.concertTime}</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top: 1px solid #e0e0e0; padding-top: 10px; margin-top: 10px;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666;">Jednotková cena:</td>
                                <td style="padding: 5px 0; text-align: right;">${data.unitPrice} Kč</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #666666;">Počet vstupenek:</td>
                                <td style="padding: 5px 0; text-align: right;">${data.ticketCount}×</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top: 1px solid #e0e0e0; padding-top: 10px; margin-top: 10px;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #333333; font-weight: bold;">Celkem k úhradě:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626;">${data.totalPrice} Kč</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Platební údaje -->
                    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #fef3c7; border-radius: 8px; margin-bottom: 20px;">
                      <tbody>
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="color: #92400e; font-size: 16px; margin: 0 0 15px 0;">Platební údaje</h2>
                            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
                              <tr>
                                <td style="padding: 5px 0; color: #78350f;">Číslo účtu:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #78350f;">${data.accountNumber}/${data.bankCode}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #78350f;">Variabilní symbol:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #78350f;">${data.variableSymbol}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #78350f;">Částka:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #78350f;">${data.totalPrice} Kč</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0; color: #78350f;">Zpráva pro příjemce:</td>
                                <td style="padding: 5px 0; text-align: right; font-weight: bold; color: #78350f;">${data.paymentMessage}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p style="margin: 20px 0; color: #666666; font-size: 14px;">
                      <strong>Důležité:</strong> Vstupenky mailem neposíláme. Po zaplacení vás budou vstupenky čekat u vstupu na koncert na vaše jméno.
                    </p>

                    <p style="margin: 0; color: #666666;">
                      Těšíme se na setkání s vámi!
                    </p>
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

// Funkce pro vytvoření plain text verze
function createOrderConfirmationText(data: {
  customerName: string
  concertTitle: string
  concertDate: string
  concertTime: string
  ticketCount: number
  unitPrice: number
  totalPrice: number
  accountNumber: string
  bankCode: string
  variableSymbol: string
  paymentMessage: string
}) {
  return `
Potvrzení objednávky

Dobrý den, ${data.customerName},

děkujeme za Vaši objednávku vstupenek na koncert ${data.concertTitle}.

DETAILY KONCERTU:
- Název: ${data.concertTitle}
- Datum: ${data.concertDate}
- Čas: ${data.concertTime}
- Počet vstupenek: ${data.ticketCount}×
- Jednotková cena: ${data.unitPrice} Kč
- Celkem k úhradě: ${data.totalPrice} Kč

PLATEBNÍ ÚDAJE:
- Číslo účtu: ${data.accountNumber}/${data.bankCode}
- Variabilní symbol: ${data.variableSymbol}
- Částka: ${data.totalPrice} Kč
- Zpráva pro příjemce: ${data.paymentMessage}

DŮLEŽITÉ: Vstupenky mailem neposíláme. Po zaplacení vás budou vstupenky čekat u vstupu na koncert na vaše jméno.

Těšíme se na setkání s vámi!

S pozdravem,
Tým Marika Singers
  `.trim()
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const {
      customerEmail,
      customerName,
      concertTitle,
      concertDate,
      concertTime,
      ticketCount,
      unitPrice,
      totalPrice,
      accountNumber,
      bankCode,
      variableSymbol,
      paymentMessage
    } = body

    if (!customerEmail || !customerName || !concertTitle) {
      throw createError({
        statusCode: 400,
        message: 'Chybí povinné parametry'
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Načtení SMTP nastavení
    const { data, error } = await supabase
      .from('settings')
      .select('smtp_settings')
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching SMTP settings:', error)
      throw createError({
        statusCode: 500,
        message: 'Nepodařilo se načíst SMTP nastavení'
      })
    }

    const smtpSettings = data?.smtp_settings

    if (!smtpSettings?.user || !smtpSettings?.password) {
      console.log('SMTP not configured, skipping email')
      return {
        success: false,
        message: 'SMTP není nakonfigurováno'
      }
    }

    // Vytvoření SMTP transportu
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host || 'smtp.websupport.cz',
      port: smtpSettings.port || 465,
      secure: smtpSettings.secure !== false,
      auth: {
        user: smtpSettings.user,
        pass: smtpSettings.password
      }
    })

    const emailData = {
      customerName,
      concertTitle,
      concertDate,
      concertTime: concertTime || '19:00',
      ticketCount: ticketCount || 1,
      unitPrice: unitPrice || 0,
      totalPrice: totalPrice || 0,
      accountNumber: accountNumber || '',
      bankCode: bankCode || '',
      variableSymbol: variableSymbol || '',
      paymentMessage: paymentMessage || concertTitle
    }

    const htmlContent = createOrderConfirmationEmail(emailData)
    const textContent = createOrderConfirmationText(emailData)

    const fromAddress = smtpSettings.from_email || smtpSettings.user
    const fromName = smtpSettings.from_name || 'Marika Singers'
    const bccAddress = smtpSettings.bcc_email || ''

    const mailOptions: any = {
      from: `"${fromName}" <${fromAddress}>`,
      to: customerEmail,
      subject: `Potvrzení objednávky - ${concertTitle}`,
      text: textContent,
      html: htmlContent
    }

    // Přidáme BCC pouze pokud je nastaveno
    if (bccAddress && bccAddress.trim()) {
      mailOptions.bcc = bccAddress.trim()
      console.log('BCC added to mail options:', mailOptions.bcc)
    } else {
      console.log('No BCC configured')
    }

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      bcc: mailOptions.bcc || 'none',
      subject: mailOptions.subject
    })

    await transporter.sendMail(mailOptions)

    // Zalogování do email_logs
    await supabase
      .from('email_logs')
      .insert({
        recipient: customerEmail,
        subject: `Potvrzení objednávky - ${concertTitle}`,
        body: textContent,
        status: 'sent',
        sent_at: new Date().toISOString()
      })

    console.log('Order confirmation email sent to:', customerEmail, bccAddress ? `(BCC: ${bccAddress})` : '')

    return {
      success: true,
      message: `Potvrzení objednávky bylo odesláno na ${customerEmail}`
    }
  } catch (err: any) {
    console.error('Error sending order confirmation:', err)

    // Neházíme chybu, aby se nezablokoval proces objednávky
    return {
      success: false,
      message: err.message || 'Chyba při odesílání potvrzení'
    }
  }
})

