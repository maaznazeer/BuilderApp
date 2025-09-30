import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MinusSquare } from 'lucide-react';

const UseMaterialForm = ({ inventoryItem, onUpdate }) => {
  const { t } = useTranslation(['custom', 'translation']);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const usedQty = parseFloat(quantity);

    if (isNaN(usedQty) || usedQty <= 0) {
      toast({ title: t('inventory.toasts.error_title'), description: "Please enter a valid positive quantity.", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (usedQty > inventoryItem.current_qty) {
      toast({ 
        title: t('inventory.toasts.error_title'), 
        description: t('inventory.toasts.insufficient_stock', { name: inventoryItem.material_name, available: inventoryItem.current_qty }),
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }

    const newQty = inventoryItem.current_qty - usedQty;
    const newStatus = newQty === 0 ? 'Used' : 'Partially Used';

    const { error } = await supabase
      .from('project_inventory')
      .update({ 
        current_qty: newQty,
        status: newStatus,
        last_updated_at: new Date().toISOString() 
      })
      .eq('id', inventoryItem.inventory_id);
    
    setLoading(false);
    if (error) {
      toast({ title: t('inventory.toasts.error_title'), description: t('inventory.toasts.error_desc', {error: error.message}), variant: "destructive" });
    } else {
      toast({ 
        title: t('inventory.toasts.used_success'),
        description: t('inventory.toasts.used_desc', { qty: usedQty, unit: inventoryItem.material_unit, name: inventoryItem.material_name }),
        variant: 'success'
      });
      onUpdate();
      setOpen(false);
      setQuantity('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={inventoryItem.current_qty === 0}>
          <MinusSquare className="mr-1 h-3 w-3" /> Use
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.use_form.title')}</DialogTitle>
          <DialogDescription>{t('inventory.use_form.description', { materialName: inventoryItem.material_name })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="quantity">{t('inventory.use_form.quantity_used')}</Label>
            <Input 
              id="quantity" 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`e.g., 5 ${inventoryItem.material_unit}`}
              required
              max={inventoryItem.current_qty}
            />
             <p className="text-sm text-gray-500 mt-1">Available: {inventoryItem.current_qty} {inventoryItem.material_unit}</p>
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? 'Updating...' : t('inventory.use_form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UseMaterialForm;