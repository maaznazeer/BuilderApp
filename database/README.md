# Database Setup and Migrations

## Required Database Migrations

### 1. Add Estimated Duration to Construction Workflow

The `construction_workflow` table is missing the `estimated_duration` column that the application expects. Run this migration to fix the error:

**File**: `alter_construction_workflow_add_estimated_duration.sql`

### 2. Add Project ID to Construction Workflow

The `construction_workflow` table is also missing the `project_id` column referenced by the app. Run this migration:

**File**: `alter_construction_workflow_add_project_id.sql`

### 3. Add Missing Columns to Construction Workflow

The application references additional fields like `status`, `step_name`, `phase`, `phase_order`, `step_order`, `template_id`, and `description`. Run this migration to add them with safe defaults:

**File**: `alter_construction_workflow_add_missing_columns.sql`

### 4. Create Materials Pivot View

The reports rely on a `v_materials_pivot` view. Create it to populate report rows and filter options:

**File**: `create_view_v_materials_pivot.sql`

### 5. Create Payroll Entries Table

To set up the new payroll system, you need to run the SQL script to create the `payroll_entries` table.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Run the SQL Script**
   - Copy the contents of `create_payroll_entries_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

3. **Verify the Table**
   - Go to the Table Editor
   - You should see the new `payroll_entries` table
   - Check that all columns are created correctly

### Table Structure:

The `payroll_entries` table includes:
- **Basic Info**: `id` (UUID), `worker_code`, `project_code`, `payment_date`
- **Hours & Rates**: `hours_worked`, `hourly_rate`, `overtime_hours`, `overtime_rate`
- **Additional**: `bonus`, `deductions`, `total_amount` (auto-calculated)
- **Status**: `status` (Pending, Approved, Paid, Rejected)
- **Metadata**: `notes`, `created_at`, `updated_at`, `created_by`, `updated_by`

### Relationships:

- **Workers**: Links to `workers.worker_code` (TEXT)
- **Projects**: Links to `projects.code` (TEXT) 
- **Users**: Links to `auth.users.id` for created_by/updated_by

### Features:

- ✅ **Auto-calculated total_amount** using a generated column
- ✅ **Foreign key constraints** to workers and projects tables
- ✅ **Row Level Security (RLS)** policies based on project ownership/membership
- ✅ **Indexes** for better performance
- ✅ **Triggers** for automatic timestamp updates
- ✅ **UUID primary key** for better scalability

### After Setup:

Once the table is created, the payroll management system will work with all the features:
- Add/edit/delete payroll entries
- Calculate totals automatically
- Track overtime, bonuses, and deductions
- Manage payroll status
- Secure data access with RLS
