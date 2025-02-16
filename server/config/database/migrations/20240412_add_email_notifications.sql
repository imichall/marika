-- Vytvoření schématu net a instalace rozšíření
CREATE SCHEMA IF NOT EXISTS net;

-- Instalace potřebných rozšíření
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Vytvoření tabulky pro logy emailů
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'failed'))
);

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

-- Odstranění všech verzí funkce
DROP FUNCTION IF EXISTS send_notification_email(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS send_notification_email(TEXT, TEXT);

-- Vytvoření funkce pro odesílání emailů
CREATE OR REPLACE FUNCTION send_notification_email(
  p_subject TEXT,
  p_body TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_recipient RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Projít všechny aktivní příjemce
  FOR v_recipient IN (
    SELECT email, name
    FROM email_recipients
    WHERE is_active = true
  ) LOOP
    -- Vytvoření záznamu v email_logs pro každého příjemce
    INSERT INTO email_logs (recipient, subject, body, status)
    VALUES (v_recipient.email, p_subject, p_body, 'pending');

    v_count := v_count + 1;
  END LOOP;

  -- Vrátit true pouze pokud byl vytvořen alespoň jeden záznam
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vytvoření funkce pro odeslání notifikace o nové referenci
CREATE OR REPLACE FUNCTION notify_new_testimonial() RETURNS TRIGGER AS $$
BEGIN
  -- Odeslání emailu všem aktivním příjemcům
  PERFORM send_notification_email(
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