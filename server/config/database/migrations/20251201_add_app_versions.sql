-- Vytvoření tabulky app_versions pro správu verzí aplikace a changelogu

CREATE TABLE IF NOT EXISTS public.app_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(50) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    release_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    CONSTRAINT version_format CHECK (version ~ '^v?[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9]+)?$')
);

-- Vytvoření indexů
CREATE INDEX IF NOT EXISTS idx_app_versions_version ON public.app_versions(version);
CREATE INDEX IF NOT EXISTS idx_app_versions_release_date ON public.app_versions(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_app_versions_is_current ON public.app_versions(is_current) WHERE is_current = true;

-- Trigger pro aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_app_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_versions_updated_at
    BEFORE UPDATE ON public.app_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_app_versions_updated_at();

-- Trigger pro zajištění, že pouze jedna verze je aktuální
CREATE OR REPLACE FUNCTION ensure_single_current_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE public.app_versions
        SET is_current = false
        WHERE is_current = true AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_versions_single_current
    BEFORE INSERT OR UPDATE ON public.app_versions
    FOR EACH ROW
    WHEN (NEW.is_current = true)
    EXECUTE FUNCTION ensure_single_current_version();

-- RLS policies
ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Veřejné čtení (všichni mohou číst verze)
CREATE POLICY app_versions_select_policy ON public.app_versions
    FOR SELECT
    USING (true);

-- Policy: Pouze admini mohou vytvářet, upravovat a mazat verze
CREATE POLICY app_versions_insert_policy ON public.app_versions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
        )
    );

CREATE POLICY app_versions_update_policy ON public.app_versions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
        )
    );

CREATE POLICY app_versions_delete_policy ON public.app_versions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE email = auth.jwt() ->> 'email'
            AND role = 'admin'
        )
    );

-- Vložení výchozí verze, pokud neexistuje
INSERT INTO public.app_versions (version, title, description, release_date, is_current, created_by)
VALUES ('1.0.0', 'Počáteční verze', 'První verze aplikace Marika', CURRENT_DATE, true, 'system')
ON CONFLICT (version) DO NOTHING;

COMMENT ON TABLE public.app_versions IS 'Tabulka pro správu verzí aplikace a changelogu';
COMMENT ON COLUMN public.app_versions.version IS 'Verze ve formátu semver (např. 1.0.0 nebo v1.0.0)';
COMMENT ON COLUMN public.app_versions.title IS 'Název verze';
COMMENT ON COLUMN public.app_versions.description IS 'Popis změn ve verzi';
COMMENT ON COLUMN public.app_versions.release_date IS 'Datum vydání verze';
COMMENT ON COLUMN public.app_versions.is_current IS 'Zda je tato verze aktuální';
