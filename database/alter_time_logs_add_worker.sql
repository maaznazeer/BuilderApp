-- Add worker_code field to time_logs table
-- This links time logs to workers for payroll integration

-- Add the worker_code column
ALTER TABLE time_logs 
ADD COLUMN IF NOT EXISTS worker_code TEXT;

-- Add foreign key constraint to workers table
-- Note: This assumes workers table has worker_code as primary key
ALTER TABLE time_logs 
ADD CONSTRAINT IF NOT EXISTS fk_time_logs_worker 
FOREIGN KEY (worker_code) REFERENCES workers(worker_code);

-- Add index for better performance on worker-based queries
CREATE INDEX IF NOT EXISTS idx_time_logs_worker_code ON time_logs(worker_code);

-- Add comment for documentation
COMMENT ON COLUMN time_logs.worker_code IS 'Worker code for payroll integration - links to workers.worker_code';

-- Create a function to automatically populate worker_code from resource_id
-- This function can be called to sync existing time logs with workers
CREATE OR REPLACE FUNCTION sync_time_logs_with_workers()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Update time_logs with worker_code where resource_id matches a worker
    UPDATE time_logs 
    SET worker_code = w.worker_code
    FROM workers w
    WHERE time_logs.resource_id = w.resource_id
    AND time_logs.worker_code IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set worker_code when inserting time logs
-- This assumes that resource_id in time_logs corresponds to resource_id in workers
CREATE OR REPLACE FUNCTION set_worker_code_from_resource()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to find worker_code from the resource_id
    SELECT worker_code INTO NEW.worker_code
    FROM workers 
    WHERE resource_id = NEW.resource_id
    LIMIT 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_set_worker_code ON time_logs;
CREATE TRIGGER trigger_set_worker_code
    BEFORE INSERT ON time_logs
    FOR EACH ROW
    EXECUTE FUNCTION set_worker_code_from_resource();