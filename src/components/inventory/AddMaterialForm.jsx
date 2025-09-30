import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MATERIAL_CATEGORIES } from '@/lib/constants.js';
import { domusDbApi } from '@/api/domusDbApi';

const AddMaterialForm = ({ open, setOpen, onMaterialAdded }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    material_name: '',
    unit_of_measure: '',
    supplier_id: '',
    supplier_name: '',
    supplier_contact_name: '',
    supplier_phone: '',
    supplier_email: '',
    supplier_website: '',
    estimated_price: '',
    stock_threshold_min: 0,
    reorder_qty: 0,
    current_stock: 0,
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await domusDbApi.getSuppliers();
        setSuppliers(data);
      } catch (error) {
        toast({ title: 'Error fetching suppliers', description: error.message, variant: 'destructive' });
      }
    };
    if (open) {
      fetchSuppliers();
    }
  }, [open, toast]);

  const handleSupplierChange = (supplierId) => {
    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplier_id: selectedSupplier.id,
        supplier_name: selectedSupplier.supplier_name,
        supplier_contact_name: selectedSupplier.contact_name,
        supplier_phone: selectedSupplier.phone,
        supplier_email: selectedSupplier.email,
        supplier_website: selectedSupplier.website,
      }));
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.from('material_inventory').insert([formData]);
    setLoading(false);

    if (error) {
      toast({ title: 'Error adding material', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'New material added to inventory.' });
      onMaterialAdded();
      setOpen(false);
      // Reset form if needed
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Material to Inventory</DialogTitle>
          <DialogDescription>
            Fill in the details for the new material. Selecting a supplier will auto-fill their contact information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="material_name">Material Name</Label>
            <Input id="material_name" value={formData.material_name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => handleSelectChange('category', value)} value={formData.category}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit_of_measure">Unit of Measure</Label>
            <Input id="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="estimated_price">Estimated Price</Label>
            <Input id="estimated_price" type="number" value={formData.estimated_price} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_stock">Current Stock</Label>
            <Input id="current_stock" type="number" value={formData.current_stock} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock_threshold_min">Stock Threshold</Label>
            <Input id="stock_threshold_min" type="number" value={formData.stock_threshold_min} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reorder_qty">Reorder Quantity</Label>
            <Input id="reorder_qty" type="number" value={formData.reorder_qty} onChange={handleChange} />
          </div>
          
          <div className="md:col-span-2 border-t pt-4 mt-2">
            <Label htmlFor="supplier_id">Supplier</Label>
            <Select onValueChange={handleSupplierChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                    {suppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
              <Label>Supplier Name</Label>
              <Input value={formData.supplier_name} readOnly disabled />
          </div>
          <div className="space-y-2">
              <Label>Supplier Contact</Label>
              <Input value={formData.supplier_contact_name} readOnly disabled />
          </div>
           <div className="space-y-2">
              <Label>Supplier Phone</Label>
              <Input value={formData.supplier_phone} readOnly disabled />
          </div>
          <div className="space-y-2">
              <Label>Supplier Email</Label>
              <Input value={formData.supplier_email} readOnly disabled />
          </div>
          <div className="space-y-2 md:col-span-2">
              <Label>Supplier Website</Label>
              <Input value={formData.supplier_website} readOnly disabled />
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Adding...' : 'Add Material'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaterialForm;