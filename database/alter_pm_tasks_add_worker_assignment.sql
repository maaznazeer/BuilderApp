-- Add worker assignment capability to pm_tasks table
-- This allows tasks to be assigned to specific workers for better tracking and payroll integration

-- Add worker_code field to pm_tasks table
ALTER TABLE pm_tasks 
ADD COLUMN IF NOT EXISTS assigned_worker_code TEXT;

-- Add foreign key constraint to workers table
-- Note: We'll use a DO block to check if constraint exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pm_tasks_worker' 
        AND table_name = 'pm_tasks'
    ) THEN
        ALTER TABLE pm_tasks 
        ADD CONSTRAINT fk_pm_tasks_worker 
        FOREIGN KEY (assigned_worker_code) REFERENCES workers(worker_code);
    END IF;
END $$;

-- Add index for better performance on worker-based queries
CREATE INDEX IF NOT EXISTS idx_pm_tasks_assigned_worker_code ON pm_tasks(assigned_worker_code);

-- Add comment for documentation
COMMENT ON COLUMN pm_tasks.assigned_worker_code IS 'Worker assigned to this task - links to workers.worker_code';

-- Create a function to get worker details for a task
CREATE OR REPLACE FUNCTION get_task_worker_details(task_uuid UUID)
RETURNS TABLE (
    worker_code TEXT,
    first_name TEXT,
    surname TEXT,
    daily_rate DECIMAL(10,2),
    trade TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.worker_code,
        w.first_name,
        w.surname,
        w.daily_rate,
        w.trade
    FROM workers w
    INNER JOIN pm_tasks t ON t.assigned_worker_code = w.worker_code
    WHERE t.task_id = task_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get all tasks assigned to a specific worker
CREATE OR REPLACE FUNCTION get_worker_tasks(worker_code_param TEXT)
RETURNS TABLE (
    task_id UUID,
    task_name TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT,
    percent_complete INTEGER,
    project_code TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.task_id,
        t.task_name,
        t.start_date,
        t.end_date,
        t.status,
        t.percent_complete,
        t.project_code
    FROM pm_tasks t
    WHERE t.assigned_worker_code = worker_code_param
    ORDER BY t.start_date;
END;
$$ LANGUAGE plpgsql;

-- Create a view for task-worker assignments with full details
CREATE OR REPLACE VIEW v_task_worker_assignments AS
SELECT 
    t.task_id,
    t.task_name,
    t.start_date,
    t.end_date,
    t.status,
    t.percent_complete,
    t.project_code,
    t.assigned_worker_code,
    w.first_name,
    w.surname,
    w.trade,
    w.daily_rate,
    w.active,
    CONCAT(w.first_name, ' ', w.surname) AS worker_full_name
FROM pm_tasks t
LEFT JOIN workers w ON t.assigned_worker_code = w.worker_code;

-- Add RLS policy for task-worker assignments
ALTER TABLE pm_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for task-worker assignments (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pm_tasks' 
        AND policyname = 'Allow users to view tasks with worker assignments'
    ) THEN
        CREATE POLICY "Allow users to view tasks with worker assignments" ON pm_tasks
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Grant permissions
GRANT SELECT ON v_task_worker_assignments TO authenticated;
GRANT EXECUTE ON FUNCTION get_task_worker_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_worker_tasks(TEXT) TO authenticated;
