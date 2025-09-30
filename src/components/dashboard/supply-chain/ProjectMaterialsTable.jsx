import React from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const fetchProjectMaterials = async () => {
    const { data, error } = await supabase.from('v_project_materials_list').select('*');
    if (error) throw new Error(error.message);
    return data;
};

const getVarianceColor = (variance, required) => {
  if (!required || required === 0) return 'text-gray-500';
  const variancePercentage = variance / required;

  if (variance > 0) return 'text-green-600'; // Surplus
  if (variance === 0) return 'text-gray-500'; // Matched
  if (variancePercentage < -0.2) return 'text-red-600 font-bold'; // Significant deficit
  if (variancePercentage < 0) return 'text-yellow-600'; // Minor deficit
  
  return 'text-gray-500';
};

const ProjectMaterialsTable = () => {
  const { data: materials, isLoading, error } = useQuery('projectMaterialsList', fetchProjectMaterials);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
          <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Error Loading Materials</span>
              </CardTitle>
          </CardHeader>
          <CardContent>
              <p>{error.message}</p>
          </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Required</TableHead>
                <TableHead className="text-right">Issued</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials?.length > 0 ? (
                materials.map((mat) => (
                  <TableRow key={`${mat.project_id}-${mat.sku}`}>
                    <TableCell className="font-medium">{mat.project}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{mat.sku}</Badge>
                    </TableCell>
                    <TableCell>{mat.name}</TableCell>
                    <TableCell className="text-right">{mat.required_qty} {mat.uom}</TableCell>
                    <TableCell className="text-right">{mat.issued_qty} {mat.uom}</TableCell>
                    <TableCell className={`text-right ${getVarianceColor(mat.variance, mat.required_qty)}`}>
                      {mat.variance > 0 ? `+${mat.variance}` : mat.variance} {mat.uom}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No project material data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectMaterialsTable;