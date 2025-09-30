import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { MATERIAL_CATEGORIES, MATERIALS_LIST } from '@/lib/constants.js';

const AddEditMaterialDialog = ({ open, setOpen, material, onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const materialOptions = useMemo(() => MATERIALS_LIST, []);

  useEffect(() => {
    setFormData(material || { current_stock: 0 });
  }, [material]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMaterialSelect = (selectedMaterialName) => {
    const selectedMaterial = materialOptions.find(m => m.name === selectedMaterialName);
    if (selectedMaterial) {
      setFormData(prev => ({
        ...prev,
        material_name: selectedMaterial.name,
        category: selectedMaterial.category,
        unit_of_measure: selectedMaterial.unit,
        typical_supplier: selectedMaterial.typicalSupplier || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        material_name: selectedMaterialName,
        category: '',
        unit_of_measure: '',
        typical_supplier: ''
      }));
    }
    setPopoverOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const payload = { ...formData };
    ['estimated_price', 'stock_threshold_min', 'reorder_qty', 'current_stock'].forEach(key => {
      if (payload[key]) payload[key] = parseFloat(payload[key]);
    });

    const { error } = material?.id
      ? await supabase.from('material_inventory').update(payload).eq('id', material.id)
      : await supabase.from('material_inventory').insert([payload]);

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Material ${material?.id ? 'updated' : 'added'}.` });
      onUpdate();
    }
  };
  
  const fieldsPart1 = [
    { id: 'category', label: t('materials.category'), type: 'select', options: MATERIAL_CATEGORIES, required: true },
    { id: 'unit_of_measure', label: t('materials.unit_of_measure'), required: true },
    { id: 'typical_supplier', label: t('materials.typical_supplier'), required: false },
    { id: 'supplier_name', label: t('materials.supplier_name') },
    { id: 'estimated_price', label: t('materials.estimated_price'), type: 'number' },
  ];
  
  const fieldsPart2 = [
    { id: 'current_stock', label: t('materials.current_stock'), type: 'number', required: true },
    { id: 'stock_threshold_min', label: t('materials.stock_threshold'), type: 'number' },
    { id: 'reorder_qty', label: t('materials.reorder_quantity'), type: 'number' },
    { id: 'supplier_contact_name', label: t('materials.supplier_contact_name') },
    { id: 'supplier_phone', label: t('materials.supplier_phone') },
    { id: 'supplier_email', label: t('materials.supplier_email'), type: 'email' },
    { id: 'supplier_website', label: t('materials.supplier_website'), type: 'url' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{material?.id ? t('materials.edit_dialog_title') : t('materials.add_dialog_title')}</DialogTitle>
          <DialogDescription>{material?.id ? t('materials.edit_dialog_desc') : t('materials.add_dialog_desc')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="space-y-2">
            <Label htmlFor="material_name">{t('materials.material_name')}</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={popoverOpen} className="w-full justify-between">
                        {formData.material_name || "Select material..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput placeholder="Search material..." onValueChange={(val) => {
                            if (!materialOptions.some(m => m.name === val)) {
                                setFormData(prev => ({ ...prev, material_name: val }));
                            }
                        }}/>
                        <CommandEmpty>No material found.</CommandEmpty>
                        <CommandGroup>
                            {materialOptions.map((opt) => (
                                <CommandItem key={opt.name} value={opt.name} onSelect={handleMaterialSelect}>
                                    {opt.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
          </div>
          
          {fieldsPart1.map(field => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === 'select' ? (
                 <Select onValueChange={(value) => handleSelectChange(field.id, value)} value={formData[field.id] || ''}>
                    <SelectTrigger id={field.id}>
                        <SelectValue placeholder={`Select a ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              ) : (
                <Input id={field.id} type={field.type || 'text'} value={formData[field.id] || ''} onChange={handleChange} required={field.required} />
              )}
            </div>
          ))}

          <div className="md:col-span-2 my-2 border-t border-gray-200"></div>

          {fieldsPart2.map(field => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input id={field.id} type={field.type || 'text'} value={formData[field.id] || ''} onChange={handleChange} required={field.required} />
            </div>
          ))}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t('materials.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : t('materials.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditMaterialDialog;