-- Vytvoření tabulky pro logy emailů
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- Přidání RLS politik
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení - pouze pro uživatele s oprávněním
CREATE POLICY "Email logs are viewable by users with permissions"
  ON email_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      JOIN user_permissions up ON ur.id = up.role_id
      JOIN permissions p ON p.id = up.permission_id
      WHERE ur.email = auth.jwt() ->> 'email'
      AND p.section = 'emails'
      AND p.action IN ('view', 'manage')
    )
  );

-- Upravení funkce send_notification_email pro logování
CREATE OR REPLACE FUNCTION send_notification_email(
  p_to TEXT,
  p_subject TEXT,
  p_body TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Vytvoření záznamu v logu
  INSERT INTO email_logs (recipient, subject, body)
  VALUES (p_to, p_subject, p_body)
  RETURNING id INTO v_log_id;

  -- Odeslání emailu pomocí pg_notify
  PERFORM pg_notify(
    'email_notification',
    json_build_object(
      'to', p_to,
      'subject', p_subject,
      'body', p_body,
      'log_id', v_log_id
    )::text
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkce pro aktualizaci stavu emailu
CREATE OR REPLACE FUNCTION update_email_status(
  p_log_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE email_logs
  SET
    status = p_status,
    error_message = p_error_message,
    sent_at = CASE WHEN p_status = 'sent' THEN NOW() ELSE sent_at END
  WHERE id = p_log_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;