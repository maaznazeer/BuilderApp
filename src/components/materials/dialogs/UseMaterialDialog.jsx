import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const UseMaterialDialog = ({ open, setOpen, material, onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (quantity > material.current_stock) {
      toast({ title: t('materials.insufficient_stock'), variant: 'destructive' });
      return;
    }
    setLoading(true);
    
    const { error } = await supabase
      .from('material_inventory')
      .update({ current_stock: material.current_stock - quantity })
      .eq('id', material.id);
    
    setLoading(false);
    if (error) {
      toast({ title: t('materials.error_using_material'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Success", description: t('materials.success_use') });
      onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('materials.use_dialog_title')}</DialogTitle>
          <DialogDescription>{t('materials.use_dialog_desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>Material: <strong>{material.material_name}</strong></p>
          <p>Current Stock: <strong>{material.current_stock}</strong></p>
          <div className="space-y-2">
            <Label htmlFor="quantity">{t('materials.quantity')}</Label>
            <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value, 10))} min="1" max={material.current_stock} />
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

export default UseMaterialDialog;