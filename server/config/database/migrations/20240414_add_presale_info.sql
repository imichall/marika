-- Add presale information columns
ALTER TABLE concerts
ADD COLUMN has_presale BOOLEAN DEFAULT FALSE,
ADD COLUMN presale_text TEXT;

-- Update RLS policies
ALTER POLICY "Enable read access for all users" ON "public"."concerts"
    USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."concerts";
CREATE POLICY "Enable insert for authenticated users only" ON "public"."concerts"
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable update for authenticated users only" ON "public"."concerts"
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create concert_editor role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'concert_editor') THEN
    CREATE ROLE concert_editor;
  END IF;
END
$$;

-- Update concert_editor role permissions
GRANT SELECT, INSERT, UPDATE (
    title,
    date,
    time,
    description,
    detailed_description,
    group_name,
    price,
    is_voluntary,
    has_presale,
    presale_text,
    image,
    image_position,
    variable_symbol,
    qr_session,
    account_number,
    bank_code,
    ticket_id,
    is_archived
) ON concerts TO concert_editor;