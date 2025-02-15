-- Vytvoření funkce pro odesílání emailů
CREATE OR REPLACE FUNCTION send_notification_email(
  p_to TEXT,
  p_subject TEXT,
  p_body TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Vytvoření záznamu v email_logs
  INSERT INTO email_logs (recipient, subject, body, status)
  VALUES (p_to, p_subject, p_body, 'pending');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vytvoření funkce pro odeslání notifikace o nové referenci
CREATE OR REPLACE FUNCTION notify_new_testimonial() RETURNS TRIGGER AS $$
BEGIN
  -- Odeslání emailu administrátorovi
  PERFORM send_notification_email(
    'iimichal.svoboda@gmail.com',
    'Nová reference na webu Marika',
    format('Nová reference od %s (%s):%s%s%s', NEW.name, NEW.email, E'\n', E'\n', NEW.message)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vytvoření triggeru pro odeslání notifikace při vložení nové reference
DROP TRIGGER IF EXISTS testimonial_notification_trigger ON form_messages;
CREATE TRIGGER testimonial_notification_trigger
  AFTER INSERT ON form_messages
  FOR EACH ROW
  WHEN (NEW.is_testimonial = true)
  EXECUTE FUNCTION notify_new_testimonial();