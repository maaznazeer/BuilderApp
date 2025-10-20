import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, FilterX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const fetchFallbackData = async (filters) => {
  console.log('[materialsPivot] fallback aggregation path');
  // Resolve project filter: map project code (string) to project id (UUID) if provided
  let projectIdFilter = null;
  if (filters.project_code) {
    const { data: proj, error: projErr } = await supabase
      .from('projects')
      .select('id, code')
      .eq('code', filters.project_code)
      .single();
    if (projErr) {
      console.warn('[materialsPivot] fallback project lookup error:', projErr.message);
    } else if (proj?.id) {
      projectIdFilter = proj.id;
    }
  }

  // Resolve supplier filter: ensure we have the supplier_code we need
  let supplierIdFilter = null;
  if (filters.supplier_code) {
    const { data: sup, error: supErr } = await supabase
      .from('suppliers')
      .select('id, supplier_code')
      .eq('supplier_code', filters.supplier_code)
      .single();
    if (supErr) {
      console.warn('[materialsPivot] fallback supplier lookup error:', supErr.message);
    } else if (sup?.id) {
      supplierIdFilter = sup.id;
    }
  }

  // Fetch base tables (scoped by filters when possible)
  const { data: tasks, error: tasksErr } = await supabase
    .from('pm_tasks')
    .select('task_id, project_code');
  if (tasksErr) throw new Error(tasksErr.message);

  const filteredTasks = projectIdFilter
    ? (tasks || []).filter(t => t.project_code === projectIdFilter)
    : (tasks || []);
  const taskIds = filteredTasks.map(t => t.task_id);

  if (taskIds.length === 0) {
    console.log('[materialsPivot] fallback: no tasks after filter');
    return [];
  }

  const { data: tmis, error: tmErr } = await supabase
    .from('task_materials')
    .select('task_id, material_id, quantity_planned, quantity_used')
    .in('task_id', taskIds);
  if (tmErr) throw new Error(tmErr.message);

  const materialIds = [...new Set((tmis || []).map(tm => tm.material_id))];
  if (materialIds.length === 0) {
    console.log('[materialsPivot] fallback: no task_materials');
    return [];
  }

  const { data: materials, error: matErr } = await supabase
    .from('materials')
    .select('id, name, unit_cost, supplier_id')
    .in('id', materialIds);
  if (matErr) throw new Error(matErr.message);

  // Optional supplier filter
  const filteredMaterials = supplierIdFilter
    ? (materials || []).filter(m => m.supplier_id === supplierIdFilter)
    : (materials || []);
  const allowedMaterialIds = new Set(filteredMaterials.map(m => m.id));

  // Projects and suppliers maps
  const projectIds = [...new Set(filteredTasks.map(t => t.project_code))];
  const { data: projects, error: projAllErr } = await supabase
    .from('projects')
    .select('id, code')
    .in('id', projectIds);
  if (projAllErr) throw new Error(projAllErr.message);
  const projectCodeById = new Map((projects || []).map(p => [p.id, p.code]));

  const supplierIds = [...new Set(filteredMaterials.map(m => m.supplier_id).filter(Boolean))];
  let supplierCodeById = new Map();
  if (supplierIds.length > 0) {
    const { data: sups, error: supsErr } = await supabase
      .from('suppliers')
      .select('id, supplier_code')
      .in('id', supplierIds);
    if (supsErr) throw new Error(supsErr.message);
    supplierCodeById = new Map((sups || []).map(s => [s.id, s.supplier_code]));
  }

  // Build join maps
  const taskById = new Map(filteredTasks.map(t => [t.task_id, t]));
  const materialById = new Map(filteredMaterials.map(m => [m.id, m]));

  // Aggregate
  const groupKey = (projCode, suppCode, materialName) => `${projCode}__${suppCode || ''}__${materialName}`;
  const grouped = new Map();
  for (const tm of tmis || []) {
    if (!allowedMaterialIds.has(tm.material_id)) continue;
    const task = taskById.get(tm.task_id);
    const mat = materialById.get(tm.material_id);
    if (!task || !mat) continue;
    const projCode = projectCodeById.get(task.project_code) || null;
    const suppCode = supplierCodeById.get(mat.supplier_id) || null;
    const key = groupKey(projCode, suppCode, mat.name);
    if (!grouped.has(key)) {
      grouped.set(key, {
        project_code: projCode,
        supplier_code: suppCode,
        building_material: mat.name,
        sum_quantities: 0,
        avg_unit_price: 0,
        sum_total_amount: 0,
        total_remaining: 0,
        notes: null,
        _unit_prices: [],
      });
    }
    const g = grouped.get(key);
    const qtyPlanned = Number(tm.quantity_planned || 0);
    const qtyUsed = Number(tm.quantity_used || 0);
    const unitPrice = Number(mat.unit_cost || 0);
    g.sum_quantities += qtyPlanned;
    if (unitPrice > 0) g._unit_prices.push(unitPrice);
    g.sum_total_amount += qtyPlanned * unitPrice;
    g.total_remaining += Math.max(qtyPlanned - qtyUsed, 0);
  }
  // finalize avg
  const rows = Array.from(grouped.values()).map(r => ({
    ...r,
    avg_unit_price: r._unit_prices.length ? (r._unit_prices.reduce((a, b) => a + b, 0) / r._unit_prices.length) : 0,
  }));
  console.log('[materialsPivot] fallback rows:', rows.length);
  return rows;
};

const fetchViewData = async (filters) => {
  console.log('[materialsPivot] fetching view data with filters:', filters);
  let query = supabase.from('v_materials_pivot').select('*');

  if (filters.project_code) {
    query = query.eq('project_code', filters.project_code);
  }
  if (filters.supplier_code) {
    query = query.eq('supplier_code', filters.supplier_code);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    console.error('[materialsPivot] fetch error:', error);
    throw new Error(error.message);
  }

  console.log('[materialsPivot] fetched rows:', data?.length || 0, 'sample:', data?.[0]);
  if (!data || data.length === 0) {
    // Try fallback client-side aggregation
    try {
      const fallback = await fetchFallbackData(filters);
      return fallback;
    } catch (e) {
      console.warn('[materialsPivot] fallback failed:', e.message);
    }
  }
  return data;
};

const fetchFilterOptionsFromView = async (columnName) => {
  const { data, error } = await supabase
    .from('v_materials_pivot')
    .select(columnName)
    .not(columnName, 'is', null);

  if (error) throw new Error(error.message);
  const values = [...new Set((data || []).map(item => item[columnName]).filter(Boolean))].sort();
  console.log(`[materialsPivot] distinct from view ${columnName}:`, values.length);
  return values;
};

const fetchDistinctFromTable = async (tableName, columnName) => {
  const { data, error } = await supabase
    .from(tableName)
    .select(columnName)
    .not(columnName, 'is', null);

  if (error) throw new Error(error.message);
  const values = [...new Set((data || []).map(item => item[columnName]).filter(Boolean))].sort();
  console.log(`[materialsPivot] distinct from ${tableName}.${columnName}:`, values.length);
  return values;
};

// Fetch project options as { code, name }
const fetchProjectOptions = async () => {
  const codes = await fetchFilterOptionsFromView('project_code');
  if (codes && codes.length > 0) {
    const { data, error } = await supabase
      .from('projects')
      .select('code, name')
      .in('code', codes);
    if (error) throw new Error(error.message);
    const byCode = new Map((data || []).map(p => [p.code, p.name]));
    const mapped = codes.map(code => ({ code, name: byCode.get(code) || code }));
    console.log('[materialsPivot] project options from view codes:', mapped.length);
    return mapped;
  }
  const { data, error } = await supabase
    .from('projects')
    .select('code, name')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  const list = (data || []).map(p => ({ code: p.code, name: p.name || p.code }));
  console.log('[materialsPivot] project options from projects:', list.length);
  return list;
};

// Fetch supplier options as { code, name }
const fetchSupplierOptions = async () => {
  const codes = await fetchFilterOptionsFromView('supplier_code');
  if (codes && codes.length > 0) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('supplier_code, supplier_name')
      .in('supplier_code', codes);
    if (error) throw new Error(error.message);
    const byCode = new Map((data || []).map(s => [s.supplier_code, s.supplier_name]));
    const mapped = codes.map(code => ({ code, name: byCode.get(code) || code }));
    console.log('[materialsPivot] supplier options from view codes:', mapped.length);
    return mapped;
  }
  const { data, error } = await supabase
    .from('suppliers')
    .select('supplier_code, supplier_name')
    .order('supplier_name', { ascending: true });
  if (error) throw new Error(error.message);
  const list = (data || []).map(s => ({ code: s.supplier_code, name: s.supplier_name || s.supplier_code }));
  console.log('[materialsPivot] supplier options from suppliers:', list.length);
  return list;
};

const MaterialsPivotWidget = () => {
  const [filters, setFilters] = useState({
    project_code: '',
    supplier_code: '',
  });
  const { toast } = useToast();

  const { data, error, isLoading, refetch } = useQuery(
    ['materialsPivot', filters],
    () => fetchViewData(filters),
    {
      onError: (err) => {
        console.error('[materialsPivot] query error:', err);
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: err.message,
        });
      },
      onSuccess: (rows) => {
        console.log('[materialsPivot] query success rows:', rows?.length || 0);
      }
    }
  );

  const { data: projects } = useQuery('pivot_projects', fetchProjectOptions, {
    onSuccess: (opts) => console.log('[materialsPivot] loaded projects options:', opts?.length || 0),
    onError: (e) => console.error('[materialsPivot] projects options error:', e)
  });
  const { data: suppliers } = useQuery('pivot_suppliers', fetchSupplierOptions, {
    onSuccess: (opts) => console.log('[materialsPivot] loaded suppliers options:', opts?.length || 0),
    onError: (e) => console.error('[materialsPivot] suppliers options error:', e)
  });
  // Category filter removed

  const projectNameByCode = useMemo(() => {
    const map = new Map();
    (projects || []).forEach(p => map.set(p.code, p.name));
    return map;
  }, [projects]);

  const supplierNameByCode = useMemo(() => {
    const map = new Map();
    (suppliers || []).forEach(s => map.set(s.code, s.name));
    return map;
  }, [suppliers]);

  const projectCodeSet = useMemo(() => new Set((projects || []).map(p => p.code)), [projects]);
  const supplierCodeSet = useMemo(() => new Set((suppliers || []).map(s => s.code)), [suppliers]);

  const handleFilterChange = (key, value) => {
    const normalized = value === 'all' ? '' : value;
    if (key === 'project_code' && normalized && !projectCodeSet.has(normalized)) {
      console.warn('[materialsPivot] invalid project_code selected, clearing:', normalized);
      setFilters(prev => ({ ...prev, project_code: '' }));
      return;
    }
    if (key === 'supplier_code' && normalized && !supplierCodeSet.has(normalized)) {
      console.warn('[materialsPivot] invalid supplier_code selected, clearing:', normalized);
      setFilters(prev => ({ ...prev, supplier_code: '' }));
      return;
    }
    setFilters(prev => ({ ...prev, [key]: normalized }));
  };

  React.useEffect(() => {
    console.log('[materialsPivot] filters changed:', filters);
  }, [filters]);

  const clearFilters = () => {
    setFilters({ project_code: '', supplier_code: '' });
  };
  
  const formatCurrency = (amount) => {
    if (amount === null || typeof amount === 'undefined') return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Materials Pivot Report</CardTitle>
        <CardDescription>Analyze material data per project and supplier.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg border">
          <Select value={filters.project_code} onValueChange={(value) => handleFilterChange('project_code', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.supplier_code} onValueChange={(value) => handleFilterChange('supplier_code', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers?.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Category filter removed */}
          <Button onClick={clearFilters} variant="ghost">
            <FilterX className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-destructive text-center p-4 bg-destructive/10 rounded-md">
            Failed to load data: {error.message}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Sum of Qty</TableHead>
                  <TableHead className="text-right">Avg Unit Price</TableHead>
                  <TableHead className="text-right">Sum Total Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  {/* <TableHead>Notes</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <TableRow key={`${item.project_code}-${item.supplier_code}-${item.building_material}-${index}`}>
                      <TableCell>{projectNameByCode.get(item.project_code) || item.project_code}</TableCell>
                      <TableCell>{supplierNameByCode.get(item.supplier_code) || item.supplier_code}</TableCell>
                      <TableCell className="font-medium">{item.building_material}</TableCell>
                      <TableCell className="text-right">{item.sum_quantities}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.avg_unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.sum_total_amount)}</TableCell>
                      <TableCell className="text-right">{item.total_remaining}</TableCell>
                      {/* <TableCell className="max-w-xs truncate">{item.notes}</TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-muted-foreground mb-2">No materials data available</div>
                        <div className="text-sm text-muted-foreground">
                          Start by adding materials to your projects to see reports here.
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialsPivotWidget;