-- Funkce pro odeslání emailu všem aktivním příjemcům
CREATE OR REPLACE FUNCTION send_notification_email(
  p_subject TEXT,
  p_body TEXT
) RETURNS VOID AS $$
DECLARE
  v_recipient RECORD;
BEGIN
  -- Projít všechny aktivní příjemce
  FOR v_recipient IN (
    SELECT email, name
    FROM email_recipients
    WHERE is_active = true
  ) LOOP
    -- Odeslat email každému příjemci
    PERFORM net.send_email(
      smtp_username := current_setting('app.smtp_username'),
      smtp_password := current_setting('app.smtp_password'),
      smtp_server := current_setting('app.smtp_server'),
      smtp_port := current_setting('app.smtp_port')::integer,
      sender := current_setting('app.smtp_sender'),
      recipient := v_recipient.email,
      subject := p_subject,
      body := p_body,
      html := true
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;