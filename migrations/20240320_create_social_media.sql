-- Create social media table
CREATE TABLE IF NOT EXISTS "public"."social_media" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "platform" text NOT NULL,
    "url" text NOT NULL,
    "icon" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "social_media_pkey" PRIMARY KEY ("id")
);

-- Add comment to the table
COMMENT ON TABLE "public"."social_media" IS 'Stores social media links and icons';

-- Enable RLS
ALTER TABLE "public"."social_media" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON "public"."social_media"
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admin insert" ON "public"."social_media"
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update" ON "public"."social_media"
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete" ON "public"."social_media"
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_social_media_updated_at
    BEFORE UPDATE ON social_media
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();