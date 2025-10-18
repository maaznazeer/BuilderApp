-- Create task_materials junction table to link tasks with materials
-- Note: Both pm_tasks.task_id and materials.id are UUID types
CREATE TABLE IF NOT EXISTS task_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES pm_tasks(task_id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity_planned DECIMAL(10,2) NOT NULL DEFAULT 0,
    quantity_used DECIMAL(10,2) DEFAULT 0,
    unit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_materials_task_id ON task_materials(task_id);
CREATE INDEX IF NOT EXISTS idx_task_materials_material_id ON task_materials(material_id);
CREATE INDEX IF NOT EXISTS idx_task_materials_created_at ON task_materials(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_task_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_materials_updated_at
    BEFORE UPDATE ON task_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_task_materials_updated_at();

-- Add RLS policies
ALTER TABLE task_materials ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow all authenticated users to access task_materials
-- You can add more specific policies later once the table is created
CREATE POLICY "Allow authenticated users to access task_materials" ON task_materials
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON task_materials TO authenticated;