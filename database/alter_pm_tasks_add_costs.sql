-- Add cost tracking fields to pm_tasks table
-- This allows tracking estimated vs actual costs for labor and materials

-- Add estimated cost fields
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS estimated_labor_cost DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_material_cost DECIMAL(12,2) DEFAULT 0;

-- Add actual cost fields  
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS actual_labor_cost DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_material_cost DECIMAL(12,2) DEFAULT 0;

-- Add total cost fields (computed from labor + material)
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS estimated_total_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(estimated_labor_cost, 0) + COALESCE(estimated_material_cost, 0)
) STORED,
ADD COLUMN IF NOT EXISTS actual_total_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(actual_labor_cost, 0) + COALESCE(actual_material_cost, 0)
) STORED;

-- Add cost variance fields (computed from actual - estimated)
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS labor_cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(actual_labor_cost, 0) - COALESCE(estimated_labor_cost, 0)
) STORED,
ADD COLUMN IF NOT EXISTS material_cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(actual_material_cost, 0) - COALESCE(estimated_material_cost, 0)
) STORED,
ADD COLUMN IF NOT EXISTS total_cost_variance DECIMAL(12,2) GENERATED ALWAYS AS (
    COALESCE(actual_total_cost, 0) - COALESCE(estimated_total_cost, 0)
) STORED;

-- Add indexes for better performance on cost queries
CREATE INDEX IF NOT EXISTS idx_pm_tasks_estimated_labor_cost ON pm_tasks(estimated_labor_cost);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_estimated_material_cost ON pm_tasks(estimated_material_cost);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_actual_labor_cost ON pm_tasks(actual_labor_cost);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_actual_material_cost ON pm_tasks(actual_material_cost);
CREATE INDEX IF NOT EXISTS idx_pm_tasks_total_cost_variance ON pm_tasks(total_cost_variance);

-- Add comments for documentation
COMMENT ON COLUMN pm_tasks.estimated_labor_cost IS 'Estimated labor cost for this task';
COMMENT ON COLUMN pm_tasks.estimated_material_cost IS 'Estimated material cost for this task';
COMMENT ON COLUMN pm_tasks.actual_labor_cost IS 'Actual labor cost incurred for this task';
COMMENT ON COLUMN pm_tasks.actual_material_cost IS 'Actual material cost incurred for this task';
COMMENT ON COLUMN pm_tasks.estimated_total_cost IS 'Total estimated cost (labor + material)';
COMMENT ON COLUMN pm_tasks.actual_total_cost IS 'Total actual cost (labor + material)';
COMMENT ON COLUMN pm_tasks.labor_cost_variance IS 'Variance between actual and estimated labor costs';
COMMENT ON COLUMN pm_tasks.material_cost_variance IS 'Variance between actual and estimated material costs';
COMMENT ON COLUMN pm_tasks.total_cost_variance IS 'Total cost variance (actual - estimated)';