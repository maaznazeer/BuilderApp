-- Add missing columns to construction_workflow referenced by the app

-- Text fields
ALTER TABLE construction_workflow
ADD COLUMN IF NOT EXISTS step_name TEXT,
ADD COLUMN IF NOT EXISTS phase TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Not Started';

-- Ordering fields
ALTER TABLE construction_workflow
ADD COLUMN IF NOT EXISTS phase_order INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS step_order INTEGER DEFAULT 1;

-- Optional template association
ALTER TABLE construction_workflow
ADD COLUMN IF NOT EXISTS template_id UUID;

-- Optional description
ALTER TABLE construction_workflow
ADD COLUMN IF NOT EXISTS description TEXT;

-- Timestamps (if not already present)
ALTER TABLE construction_workflow
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Basic indexes for common filters/sorts
CREATE INDEX IF NOT EXISTS idx_construction_workflow_status ON construction_workflow(status);
CREATE INDEX IF NOT EXISTS idx_construction_workflow_phase_order ON construction_workflow(phase_order);
CREATE INDEX IF NOT EXISTS idx_construction_workflow_step_order ON construction_workflow(step_order);
CREATE INDEX IF NOT EXISTS idx_construction_workflow_template_id ON construction_workflow(template_id);

-- updated_at function (safe to replace)
CREATE OR REPLACE FUNCTION set_construction_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_construction_workflow_updated_at'
    ) THEN
        CREATE TRIGGER trg_construction_workflow_updated_at
        BEFORE UPDATE ON construction_workflow
        FOR EACH ROW
        EXECUTE FUNCTION set_construction_workflow_updated_at();
    END IF;
END $$ LANGUAGE plpgsql;

