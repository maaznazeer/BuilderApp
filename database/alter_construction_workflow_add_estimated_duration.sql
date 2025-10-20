-- Add estimated_duration column to construction_workflow table
-- This column is used to track the estimated duration for each workflow step

-- Add the estimated_duration column
ALTER TABLE construction_workflow 
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN construction_workflow.estimated_duration IS 'Estimated duration in hours for completing this workflow step';

-- Add index for better performance on duration-based queries
CREATE INDEX IF NOT EXISTS idx_construction_workflow_estimated_duration ON construction_workflow(estimated_duration);

-- Update existing records to have a default estimated duration if they don't have one
UPDATE construction_workflow 
SET estimated_duration = 8 
WHERE estimated_duration IS NULL OR estimated_duration = 0;
