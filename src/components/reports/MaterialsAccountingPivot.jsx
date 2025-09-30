import React, { useState, useEffect, useMemo } from 'react';
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
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { Loader2, FilterX } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const fetchViewData = async (filters) => {
      let query = supabase.from('v_materials_pivot').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.project_code) {
        query = query.eq('project_code', filters.project_code);
      }
      if (filters.supplier_code) {
        query = query.eq('supplier_code', filters.supplier_code);
      }
      if (filters.search) {
        query = query.ilike('building_material', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data;
    };

    const fetchFilterOptions = async (tableName, columnName) => {
      const { data, error } = await supabase
        .from(tableName)
        .select(columnName)
        .not(columnName, 'is', null);
      if (error) throw new Error(error.message);
      return [...new Set(data.map(item => item[columnName]))];
    };

    const MaterialsAccountingPivot = () => {
      const [filters, setFilters] = useState({
        category: '',
        project_code: '',
        supplier_code: '',
        search: '',
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

      const { data: categories } = useQuery('categories', () => fetchFilterOptions('v_materials_pivot', 'category'));
      const { data: projects } = useQuery('projects', () => fetchFilterOptions('projects', 'project_code'));
      const { data: suppliers } = useQuery('suppliers', () => fetchFilterOptions('suppliers', 'supplier_code'));

      const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
      };
      
      const handleSearchChange = (event) => {
        handleFilterChange('search', event.target.value);
      };

      const clearFilters = () => {
        setFilters({ category: '', project_code: '', supplier_code: '', search: '' });
      };
      
      const formatCurrency = (amount) => {
        if (amount === null || typeof amount === 'undefined') return 'N/A';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
      };
      
      const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => item.building_material.toLowerCase().includes(filters.search.toLowerCase()));
      }, [data, filters.search]);

      return (
        <Card>
          <CardHeader>
            <CardTitle>Materials Accounting Pivot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
              <Input
                placeholder="Search by material..."
                value={filters.search}
                onChange={handleSearchChange}
                className="max-w-xs"
              />
              <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.project_code} onValueChange={(value) => handleFilterChange('project_code', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map(proj => <SelectItem key={proj} value={proj}>{proj}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.supplier_code} onValueChange={(value) => handleFilterChange('supplier_code', value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map(sup => <SelectItem key={sup} value={sup}>{sup}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={clearFilters} variant="outline">
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center">Failed to load data: {error.message}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Building Material</TableHead>
                      <TableHead>Sum of Quantities</TableHead>
                      <TableHead>Avg. Unit Price</TableHead>
                      <TableHead>Sum of Total Amount</TableHead>
                      <TableHead>Total Expenditure</TableHead>
                      <TableHead>Remaining Stock</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <TableRow key={`${item.building_material}-${index}`}>
                          <TableCell className="font-medium">{item.building_material}</TableCell>
                          <TableCell>{item.sum_quantities}</TableCell>
                          <TableCell>{formatCurrency(item.avg_unit_price)}</TableCell>
                          <TableCell>{formatCurrency(item.sum_total_amount)}</TableCell>
                          <TableCell>{formatCurrency(item.total_expenditure)}</TableCell>
                          <TableCell>{item.total_remaining}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.notes}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No results found for the selected filters.
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

    export default MaterialsAccountingPivot;