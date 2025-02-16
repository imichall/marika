-- Funkce pro notifikaci o nové referenci
CREATE OR REPLACE FUNCTION notify_new_testimonial()
RETURNS TRIGGER AS $$
BEGIN
  -- Odeslání emailu všem aktivním příjemcům
  PERFORM send_notification_email(
    'Nová reference na webu Marika',
    format('Nová reference od %s (%s):%s%s%s', NEW.name, NEW.email, E'\n', E'\n', NEW.message)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;