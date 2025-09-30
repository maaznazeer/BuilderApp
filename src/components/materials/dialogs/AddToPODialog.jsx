import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const AddToPODialog = ({ open, setOpen, material, onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('id, name');
      if (error) toast({ title: t('materials.error_fetching_projects'), variant: 'destructive' });
      else setProjects(data);
    };
    fetchProjects();
  }, [toast, t]);

  const handleSubmit = async () => {
    if (!selectedProject || !quantity) {
      toast({ title: "Missing information", description: "Please select a project and enter a quantity.", variant: "destructive" });
      return;
    }
    setLoading(true);

    let { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('id')
      .eq('project_id', selectedProject)
      .eq('supplier', material.supplier_name)
      .eq('status', 'Draft')
      .single();

    if (poError && poError.code !== 'PGRST116') {
      toast({ title: t('materials.error_adding_to_po'), description: poError.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!po) {
      const po_number = `PO-${Date.now()}`;
      const { data: newPo, error: newPoError } = await supabase
        .from('purchase_orders')
        .insert({ po_number, project_id: selectedProject, supplier: material.supplier_name, status: 'Draft' })
        .select('id')
        .single();
      
      if (newPoError) {
        toast({ title: t('materials.error_adding_to_po'), description: newPoError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }
      po = newPo;
    }

    const { error: itemError } = await supabase.from('purchase_order_items').insert({
      po_id: po.id,
      material_inventory_id: material.id,
      quantity: quantity,
      unit_price: material.estimated_price,
    });

    setLoading(false);
    if (itemError) {
      toast({ title: t('materials.error_adding_to_po'), description: itemError.message, variant: 'destructive' });
    } else {
      toast({ title: "Success", description: t('materials.success_po') });
      onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('materials.po_dialog_title')}</DialogTitle>
          <DialogDescription>{t('materials.po_dialog_desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('materials.project')}</Label>
            <Select onValueChange={setSelectedProject}>
              <SelectTrigger><SelectValue placeholder={t('materials.select_project')} /></SelectTrigger>
              <SelectContent>
                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('materials.quantity')}</Label>
            <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} min="1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t('materials.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : t('materials.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToPODialog;