-- Vytvoření tabulky pro sledování posledních přečtených zpráv v chatu
CREATE TABLE IF NOT EXISTS admin_chat_last_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR(255) NOT NULL REFERENCES user_roles(email) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_email)
);

-- Vytvoření indexu pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_admin_chat_last_read_user_email ON admin_chat_last_read(user_email);

-- Trigger pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_chat_last_read_updated_at
    BEFORE UPDATE ON admin_chat_last_read
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Povolení Row Level Security
ALTER TABLE admin_chat_last_read ENABLE ROW LEVEL SECURITY;

-- Politika pro čtení - uživatelé mohou číst pouze své záznamy
CREATE POLICY "Users can read their own last read records"
    ON admin_chat_last_read
    FOR SELECT
    USING (user_email = auth.jwt() ->> 'email');

-- Politika pro vkládání - uživatelé mohou vkládat pouze své záznamy
CREATE POLICY "Users can insert their own last read records"
    ON admin_chat_last_read
    FOR INSERT
    WITH CHECK (user_email = auth.jwt() ->> 'email');

-- Politika pro aktualizaci - uživatelé mohou aktualizovat pouze své záznamy
CREATE POLICY "Users can update their own last read records"
    ON admin_chat_last_read
    FOR UPDATE
    USING (user_email = auth.jwt() ->> 'email');

-- Politika pro mazání - uživatelé mohou mazat pouze své záznamy
CREATE POLICY "Users can delete their own last read records"
    ON admin_chat_last_read
    FOR DELETE
    USING (user_email = auth.jwt() ->> 'email');

-- Komentáře k tabulce a sloupcům
COMMENT ON TABLE admin_chat_last_read IS 'Sledování posledních přečtených zpráv v admin chatu';
COMMENT ON COLUMN admin_chat_last_read.user_email IS 'Email uživatele (reference na user_roles)';
COMMENT ON COLUMN admin_chat_last_read.last_read_at IS 'Časová značka posledního přečtení zpráv';