-- Přidání podpory pro více oddílů na jednoho člena
-- Vytvoření pomocné tabulky pro many-to-many vztah mezi členy a oddíly

-- Vytvoření pomocné tabulky
CREATE TABLE IF NOT EXISTS member_user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_user_id UUID NOT NULL REFERENCES member_users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES member_departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_user_id, department_id)
);

-- Vytvoření indexů pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_member_user_departments_member_user_id ON member_user_departments(member_user_id);
CREATE INDEX IF NOT EXISTS idx_member_user_departments_department_id ON member_user_departments(department_id);

-- Migrace existujících dat - převedeme department_id na vztah v pomocné tabulce
INSERT INTO member_user_departments (member_user_id, department_id)
SELECT id, department_id
FROM member_users
WHERE department_id IS NOT NULL
ON CONFLICT (member_user_id, department_id) DO NOTHING;

-- Povolení RLS
ALTER TABLE member_user_departments ENABLE ROW LEVEL SECURITY;

-- RLS policy pro member_user_departments - stejná jako pro member_users
CREATE POLICY "Member user departments view"
  ON member_user_departments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Member user departments manage"
  ON member_user_departments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_roles ur
      WHERE ur.email = auth.jwt() ->> 'email'
        AND ur.role IN ('admin', 'editor')
    )
  );

-- Poznámka: department_id v member_users zůstane pro zpětnou kompatibilitu
-- ale nově budeme používat member_user_departments pro více oddílů

