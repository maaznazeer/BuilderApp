import React, { useMemo, useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Trash2 } from 'lucide-react';

const fetchProjectMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const fetchProjects = async () => {
  const { data, error } = await supabase.from('projects').select('id, name');
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
  const queryClient = useQueryClient();
  const { data: materials, isLoading, error } = useQuery('projectMaterialsList', fetchProjectMaterials);
  const { data: projects } = useQuery('projectsForMaterials', fetchProjects);
  const projectsMap = useMemo(() => {
    const map = new Map();
    (projects || []).forEach(p => map.set(p.id, p.name));
    return map;
  }, [projects]);

  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', quantity: '', unit_cost: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (selected) {
      setEditForm({
        name: selected.name || '',
        quantity: selected.quantity ?? '',
        unit_cost: selected.unit_cost ?? '',
      });
    } else {
      setEditForm({ name: '', quantity: '', unit_cost: '' });
    }
  }, [selected]);

  const handleDeleteClick = (item) => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete?.id) return;
    const { error: delError } = await supabase.from('materials').delete().eq('id', toDelete.id);
    if (!delError) {
      setConfirmOpen(false);
      setToDelete(null);
      queryClient.invalidateQueries('projectMaterialsList');
    } else {
      console.error(delError);
    }
  };

  const handleEditOpen = (item) => {
    setSelected(item);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selected?.id) return;
    const payload = {
      name: String(editForm.name || ''),
      quantity: editForm.quantity === '' ? null : Number(editForm.quantity),
      unit_cost: editForm.unit_cost === '' ? null : Number(editForm.unit_cost),
    };
    const { error: updError } = await supabase.from('materials').update(payload).eq('id', selected.id);
    if (!updError) {
      setEditOpen(false);
      setSelected(null);
      queryClient.invalidateQueries('projectMaterialsList');
    } else {
      console.error(updError);
    }
  };

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
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead>Material Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials?.length > 0 ? (
                materials.map((mat) => (
                  <TableRow key={mat.id}>
                    <TableCell className="font-medium">{projectsMap.get(mat.project_id) || '-'}</TableCell>
                    <TableCell className="text-right">{mat.quantity ?? '-'}</TableCell>
                    <TableCell className="text-right">{typeof mat.unit_cost === 'number' ? `$${mat.unit_cost.toFixed(2)}` : '-'}</TableCell>
                    <TableCell>{mat.name}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditOpen(mat)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDeleteClick(mat)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No materials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {/* Edit Dialog */}
      <EditMaterialDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        form={editForm}
        setForm={setEditForm}
        onSave={handleEditSave}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete material?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the material
              {toDelete?.name ? ` "${toDelete.name}"` : ''}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProjectMaterialsTable;

// Edit Dialog
// Keep outside component return for clarity
const EditMaterialDialog = ({ open, onOpenChange, form, setForm, onSave }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Material</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input id="quantity" type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit_cost">Unit Cost</Label>
            <Input id="unit_cost" type="number" step="0.01" value={form.unit_cost} onChange={(e) => setForm((p) => ({ ...p, unit_cost: e.target.value }))} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);