-- Add project_id column to construction_workflow table
-- Links workflow steps to a project

-- Add the column (UUID assumed, adjust if your projects.id type differs)
ALTER TABLE construction_workflow 
ADD COLUMN IF NOT EXISTS project_id UUID;

-- Optionally add a foreign key if projects table exists with UUID id
-- Comment out if your schema differs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'projects'
    ) THEN
        -- Add FK only if it doesn't already exist
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conname = 'fk_construction_workflow_project'
              AND n.nspname = 'public'
        ) THEN
            BEGIN
                ALTER TABLE construction_workflow 
                ADD CONSTRAINT fk_construction_workflow_project 
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
            EXCEPTION WHEN others THEN
                -- Skip if constraint cannot be created due to type mismatch
                NULL;
            END;
        END IF;
    END IF;
END $$;

-- Index for querying by project
CREATE INDEX IF NOT EXISTS idx_construction_workflow_project_id ON construction_workflow(project_id);

