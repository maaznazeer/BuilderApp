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
import { PackagePlus } from 'lucide-react';

const ReceiveMaterialForm = ({ inventoryItem, onUpdate }) => {
  const { t } = useTranslation(['custom', 'translation']);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const receivedQty = parseFloat(quantity);
    if (isNaN(receivedQty) || receivedQty <= 0) {
      toast({ title: t('inventory.toasts.error_title'), description: "Please enter a valid positive quantity.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const newQty = inventoryItem.current_qty + receivedQty;
    const { error } = await supabase
      .from('project_inventory')
      .update({ 
        current_qty: newQty,
        status: 'Delivered',
        last_updated_at: new Date().toISOString() 
      })
      .eq('id', inventoryItem.inventory_id);
    
    setLoading(false);
    if (error) {
      toast({ title: t('inventory.toasts.error_title'), description: t('inventory.toasts.error_desc', {error: error.message}), variant: "destructive" });
    } else {
      toast({ 
        title: t('inventory.toasts.received_success'), 
        description: t('inventory.toasts.received_desc', { qty: receivedQty, unit: inventoryItem.material_unit, name: inventoryItem.material_name }),
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
        <Button variant="outline" size="sm">
          <PackagePlus className="mr-1 h-3 w-3" /> Receive
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.receive_form.title')}</DialogTitle>
          <DialogDescription>{t('inventory.receive_form.description', { materialName: inventoryItem.material_name })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="quantity">{t('inventory.receive_form.quantity_received')}</Label>
            <Input 
              id="quantity" 
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`e.g., 10 ${inventoryItem.material_unit}`}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Receiving...' : t('inventory.receive_form.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiveMaterialForm;