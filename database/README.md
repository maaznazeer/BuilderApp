# Database Setup for Payroll System

## Create Payroll Entries Table

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
