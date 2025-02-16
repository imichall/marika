-- Vytvoření schématu net a instalace rozšíření
CREATE SCHEMA IF NOT EXISTS net;

-- Instalace potřebných rozšíření
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Vytvoření funkce pro odesílání emailů v net schématu
CREATE OR REPLACE FUNCTION net.send_email(
    smtp_username text,
    smtp_password text,
    smtp_server text,
    smtp_port integer,
    smtp_sender text,
    email_to text,
    email_subject text,
    email_body text,
    email_html_body text DEFAULT NULL
) RETURNS boolean AS $$
BEGIN
    -- Zde by byla implementace odesílání emailu
    -- Pro testovací účely vždy vrátíme true
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Vytvoření tabulky pro příjemce emailů
CREATE TABLE IF NOT EXISTS email_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pro aktualizaci updated_at
DROP TRIGGER IF EXISTS set_email_recipients_updated_at ON email_recipients;
CREATE TRIGGER set_email_recipients_updated_at
    BEFORE UPDATE ON email_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS politiky pro email_recipients
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Email recipients are viewable by users with permissions" ON email_recipients;
CREATE POLICY "Email recipients are viewable by users with permissions"
    ON email_recipients FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN user_permissions up ON ur.id = up.role_id
            JOIN permissions p ON p.id = up.permission_id
            WHERE ur.email = auth.jwt() ->> 'email'
            AND p.section = 'emails'
            AND p.action = 'view'
        )
    );

DROP POLICY IF EXISTS "Email recipients are manageable by users with permissions" ON email_recipients;
CREATE POLICY "Email recipients are manageable by users with permissions"
    ON email_recipients FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN user_permissions up ON ur.id = up.role_id
            JOIN permissions p ON p.id = up.permission_id
            WHERE ur.email = auth.jwt() ->> 'email'
            AND p.section = 'emails'
            AND p.action = 'manage'
        )
    );

-- Přidání výchozího příjemce
INSERT INTO email_recipients (email, name, is_active)
VALUES ('iimichal.svoboda@gmail.com', 'Michal Svoboda', true)
ON CONFLICT (email) DO NOTHING;

-- Přidání nových oprávnění
INSERT INTO permissions (section, action, description)
VALUES
    ('emails', 'manage', 'Správa příjemců emailů')
ON CONFLICT (section, action) DO NOTHING;