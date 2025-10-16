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

const fetchViewData = async (filters) => {
  let query = supabase.from('v_materials_pivot').select('*');

  if (filters.project_code) {
    query = query.eq('project_code', filters.project_code);
  }
  if (filters.supplier_code) {
    query = query.eq('supplier_code', filters.supplier_code);
  }
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

const fetchFilterOptions = async (columnName) => {
  const { data, error } = await supabase
    .from('v_materials_pivot')
    .select(columnName)
    .not(columnName, 'is', null);

  if (error) throw new Error(error.message);
  return [...new Set(data.map(item => item[columnName]).filter(Boolean))].sort();
};

const MaterialsPivotWidget = () => {
  const [filters, setFilters] = useState({
    project_code: '',
    supplier_code: '',
    category: '',
  });
  const { toast } = useToast();

  const { data, error, isLoading, refetch } = useQuery(
    ['materialsPivot', filters],
    () => fetchViewData(filters),
    {
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: err.message,
        });
      },
    }
  );

  const { data: projects } = useQuery('pivot_projects', () => fetchFilterOptions('project_code'));
  const { data: suppliers } = useQuery('pivot_suppliers', () => fetchFilterOptions('supplier_code'));
  const { data: categories } = useQuery('pivot_categories', () => fetchFilterOptions('category'));

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ project_code: '', supplier_code: '', category: '' });
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
              {projects?.map(proj => <SelectItem key={proj} value={proj}>{proj}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.supplier_code} onValueChange={(value) => handleFilterChange('supplier_code', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers?.map(sup => <SelectItem key={sup} value={sup}>{sup}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
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
                  <TableHead>Category</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Sum of Qty</TableHead>
                  <TableHead className="text-right">Avg Unit Price</TableHead>
                  <TableHead className="text-right">Sum Total Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? (
                  data.map((item, index) => (
                    <TableRow key={`${item.project_code}-${item.supplier_code}-${item.building_material}-${index}`}>
                      <TableCell>{item.project_code}</TableCell>
                      <TableCell>{item.supplier_code}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="font-medium">{item.building_material}</TableCell>
                      <TableCell className="text-right">{item.sum_quantities}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.avg_unit_price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.sum_total_amount)}</TableCell>
                      <TableCell className="text-right">{item.total_remaining}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
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