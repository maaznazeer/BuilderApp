-- Create a pivot-like view for materials reporting expected by MaterialsPivotWidget
-- Adjust table/column names if your schema differs

CREATE OR REPLACE VIEW v_materials_pivot AS
SELECT
  p.code AS project_code,
  s.supplier_code AS supplier_code,
  COALESCE(m.category, 'Uncategorized') AS category,
  m.name AS building_material,
  SUM(tmi.quantity_planned) AS sum_quantities,
  AVG(NULLIF(m.unit_cost, 0)) AS avg_unit_price,
  SUM((tmi.quantity_planned) * COALESCE(m.unit_cost, 0)) AS sum_total_amount,
  GREATEST(SUM(tmi.quantity_planned) - SUM(COALESCE(tmi.quantity_used, 0)), 0) AS total_remaining,
  NULL::text AS notes
FROM task_materials tmi
JOIN pm_tasks t ON t.task_id = tmi.task_id
-- pm_tasks.project_code is a UUID referencing projects.id in this schema
JOIN projects p ON p.id = t.project_code
JOIN materials m ON m.id = tmi.material_id
LEFT JOIN suppliers s ON s.id = m.supplier_id
GROUP BY p.code, s.supplier_code, COALESCE(m.category, 'Uncategorized'), m.name;

-- Indexes can help if you materialize this- for a plain view they are not created

