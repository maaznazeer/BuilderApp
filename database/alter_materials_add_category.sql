-- Ensure materials table has a category column used by reporting

-- 1) Add category column if missing
ALTER TABLE materials
ADD COLUMN IF NOT EXISTS category TEXT;

-- 2) If legacy column material_category exists, backfill category from it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'materials'
          AND column_name = 'material_category'
    ) THEN
        EXECUTE $$
            UPDATE materials
            SET category = material_category
            WHERE category IS NULL AND material_category IS NOT NULL
        $$;
    END IF;
END $$ LANGUAGE plpgsql;

-- 3) Optional index if filtering by category often
CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);

