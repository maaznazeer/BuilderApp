-- Create payroll_entries table with all necessary fields
CREATE TABLE IF NOT EXISTS payroll_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_code TEXT NOT NULL,
    project_code TEXT NOT NULL,
    payment_date DATE NOT NULL,
    hours_worked DECIMAL(8,2) DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    overtime_hours DECIMAL(8,2) DEFAULT 0,
    overtime_rate DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (
        (hours_worked * hourly_rate) + 
        (overtime_hours * overtime_rate) + 
        bonus - deductions
    ) STORED,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Paid', 'Rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Add foreign key constraints based on your existing schema
ALTER TABLE payroll_entries 
ADD CONSTRAINT fk_payroll_entries_worker 
FOREIGN KEY (worker_code) REFERENCES workers(worker_code);

-- Note: project_code in your schema is TEXT, not UUID, so we'll link to projects.code
ALTER TABLE payroll_entries 
ADD CONSTRAINT fk_payroll_entries_project 
FOREIGN KEY (project_code) REFERENCES projects(code);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payroll_entries_worker_code ON payroll_entries(worker_code);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_project_code ON payroll_entries(project_code);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_payment_date ON payroll_entries(payment_date);
CREATE INDEX IF NOT EXISTS idx_payroll_entries_status ON payroll_entries(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payroll_entries_updated_at 
    BEFORE UPDATE ON payroll_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payroll_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies based on your existing schema
CREATE POLICY "Users can view payroll entries for their projects" ON payroll_entries
    FOR SELECT USING (
        project_code IN (
            SELECT code FROM projects 
            WHERE owner_uuid = auth.uid()
            OR code IN (
                SELECT project_code FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert payroll entries for their projects" ON payroll_entries
    FOR INSERT WITH CHECK (
        project_code IN (
            SELECT code FROM projects 
            WHERE owner_uuid = auth.uid()
            OR code IN (
                SELECT project_code FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update payroll entries for their projects" ON payroll_entries
    FOR UPDATE USING (
        project_code IN (
            SELECT code FROM projects 
            WHERE owner_uuid = auth.uid()
            OR code IN (
                SELECT project_code FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete payroll entries for their projects" ON payroll_entries
    FOR DELETE USING (
        project_code IN (
            SELECT code FROM projects 
            WHERE owner_uuid = auth.uid()
            OR code IN (
                SELECT project_code FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Grant permissions
GRANT ALL ON payroll_entries TO authenticated;
