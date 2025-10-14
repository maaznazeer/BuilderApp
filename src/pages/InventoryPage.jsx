import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import Papa from 'papaparse';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Upload, PlusCircle, Link as LinkIcon, Loader2, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { domusDbApi } from '@/api/domusDbApi';
import { MATERIAL_CATEGORIES, MATERIALS_LIST } from '@/lib/constants';

const INVENTORY_UNITS = ["bag", "m³", "piece", "metre", "m²", "roll", "sheet", "panel", "tonne", "set", "pot", "pair", "litre", "kg", "day"];

const InventoryItemForm = ({ open, setOpen, item, suppliers, onUpdate, showMaterialSelector, setShowMaterialSelector, selectedMaterials, setSelectedMaterials }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const initialData = item || { current_stock: 0, category: '', material_name: '', material_code: '', unit: '' };
    setFormData(initialData);
  }, [item]);

  // Debug form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
    console.log('Selected materials:', selectedMaterials);
    console.log('Available suppliers:', suppliers);
  }, [formData, selectedMaterials, suppliers]);

  // Update form data when selected materials change
  useEffect(() => {
    if (selectedMaterials.length > 0) {
      const material = selectedMaterials[0];
      console.log('Auto-updating form data from selected materials:', material);
      setFormData(prev => ({
        ...prev,
        material_name: material.name,
        category: material.category,
        unit: material.unit
      }));
      // Force form re-render
      setFormKey(prev => prev + 1);
    }
  }, [selectedMaterials]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleMaterialSelected = (materials) => {
    console.log('=== DIRECT MATERIAL SELECTION ===');
    console.log('Materials received:', materials);
    
    // Set selected materials first
    setSelectedMaterials(materials);
    setShowMaterialSelector(false);
    
    // If materials are selected, auto-fill the form with the first material
    if (materials.length > 0) {
      const material = materials[0];
      console.log('First material:', material);
      console.log('Material category:', material.category);
      
      // Immediately update form data
      const newFormData = {
        material_name: material.name,
        category: material.category,
        unit: material.unit,
        material_code: formData.material_code || '',
        current_stock: formData.current_stock || 0,
        stock_threshold_min: formData.stock_threshold_min || 0,
        reorder_qty: formData.reorder_qty || 0,
        primary_supplier_code: formData.primary_supplier_code || '',
        backup_supplier_code: formData.backup_supplier_code || ''
      };
      
      console.log('Setting new form data:', newFormData);
      setFormData(newFormData);
      
      // Force form re-render
      setFormKey(prev => prev + 1);
    }
  };

  const handleAddMultipleMaterials = async () => {
    setLoading(true);
    try {
      for (const material of selectedMaterials) {
        const payload = {
          material_name: material.name,
          category: material.category,
          unit: material.unit,
          current_stock: 0,
          stock_threshold_min: 0,
          reorder_qty: 0,
          primary_supplier_code: '',
          backup_supplier_code: ''
        };
        
        const { error } = await supabase.from('inventory_items').insert([payload]);
        if (error) {
          console.error('Error adding material:', material.name, error);
        }
      }
      
      toast({ 
        title: 'Success', 
        description: `Added ${selectedMaterials.length} materials to inventory.`,
        variant: 'default'
      });
      
      onUpdate();
      setSelectedMaterials([]);
      setOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to add some materials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    // Required field validation
    if (!formData.material_name?.trim()) {
      errors.push('Material name is required');
    }
    
    if (!formData.category?.trim()) {
      errors.push('Category is required');
    }
    
    if (!formData.unit?.trim()) {
      errors.push('Unit is required');
    }
    
    // Numeric field validation
    const numericFields = ['current_stock', 'stock_threshold_min', 'reorder_qty'];
    numericFields.forEach(field => {
      const value = formData[field];
      if (value !== undefined && value !== '' && (isNaN(Number(value)) || Number(value) < 0)) {
        errors.push(`${field.replace('_', ' ')} must be a valid positive number`);
      }
    });
    
    // Material code validation (if provided)
    if (formData.material_code && formData.material_code.trim().length < 3) {
      errors.push('Material code must be at least 3 characters long');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    // Validate form data
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({ 
        title: 'Validation Error', 
        description: validationErrors.join(', '), 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    
    try {
      const payload = { ...formData };
      
      // Clean and validate numeric fields
      ['stock_threshold_min', 'reorder_qty', 'current_stock'].forEach(key => {
        payload[key] = payload[key] ? Number(payload[key]) : 0;
      });
      
      // Ensure string fields are trimmed
      ['material_name', 'category', 'unit', 'material_code', 'primary_supplier_code', 'backup_supplier_code'].forEach(key => {
        if (payload[key]) {
          payload[key] = payload[key].toString().trim();
        }
      });
      
      // Remove empty supplier codes to avoid database issues
      if (!payload.primary_supplier_code || payload.primary_supplier_code.trim() === '') {
        delete payload.primary_supplier_code;
      }
      if (!payload.backup_supplier_code || payload.backup_supplier_code.trim() === '') {
        delete payload.backup_supplier_code;
      }
      
      // The ID column is a UUID generated by the DB. We should not send it on insert.
      if (!item?.id) {
        delete payload.id;
      }

      console.log('Saving payload to database:', payload);
      
      // Test database connection and table structure
      const { data: testData, error: testError } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
      } else {
        console.log('Database connection test successful. Sample data:', testData);
      }
      
      const { data, error } = item?.id
        ? await supabase.from('inventory_items').update(payload).eq('id', item.id).select()
        : await supabase.from('inventory_items').insert([payload]).select();

      if (error) {
        console.error('Database error:', error);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error code:', error.code);
        toast({ 
          title: 'Database Error', 
          description: error.message || 'Failed to save inventory item', 
          variant: 'destructive' 
        });
      } else {
        console.log('Successfully saved to database:', data);
        const action = item?.id ? 'updated' : 'added';
        toast({ 
          title: 'Success', 
          description: `Inventory item ${action} successfully.`,
          variant: 'default'
        });
        
        // Clear form data for new items
        if (!item?.id) {
          setFormData({ current_stock: 0, category: '', material_name: '', material_code: '', unit: '' });
        }
        
        onUpdate();
        setOpen(false);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({ 
        title: 'Unexpected Error', 
        description: 'An unexpected error occurred. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open && !showMaterialSelector} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{item?.id ? 'Edit Item' : 'Add Item'}</DialogTitle>
          <DialogDescription>Fill in the details for the inventory item</DialogDescription>
        </DialogHeader>
        
        {/* Material Selector Button - Only for new items */}
        {!item?.id && (
          <div className="py-4 border-b">
            <div className="flex justify-center mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowMaterialSelector(true)}
                className="flex items-center gap-2 px-6 py-2"
              >
                <Package className="h-4 w-4" />
                Browse Materials by Category
              </Button>
            </div>
            
            {/* Show selected material info */}
            {selectedMaterials.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Selected Materials ({selectedMaterials.length})
                  </span>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <strong>Category:</strong> 
                    <Badge variant="outline" className="text-xs">
                      {formData.category || 'No category set'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Primary Material:</strong> 
                    <span className="font-medium">{formData.material_name || 'No material selected'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Unit:</strong> 
                    <Badge variant="secondary" className="text-xs">
                      {formData.unit || 'No unit set'}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <strong>All selected materials:</strong>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedMaterials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {material.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div key={formKey} className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Material Code */}
            <div className="space-y-2">
              <Label htmlFor="material_code">Material Code *</Label>
              <Input 
                id="material_code" 
                value={formData.material_code || ''} 
                onChange={handleChange}
                placeholder="Enter material code"
              />
            </div>
            
            {/* Material Name */}
            <div className="space-y-2">
              <Label htmlFor="material_name">Material Name *</Label>
              <Input 
                id="material_name" 
                value={formData.material_name || ''} 
                onChange={handleChange}
                disabled={selectedMaterials.length > 0}
                className={selectedMaterials.length > 0 ? 'bg-gray-100' : ''}
                placeholder="Enter material name"
                required
              />
              {selectedMaterials.length > 0 && (
                <p className="text-xs text-gray-500">Material name is auto-filled from category selection</p>
              )}
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                onValueChange={(v) => handleSelectChange('category', v)} 
                value={formData.category || ''}
                disabled={selectedMaterials.length > 0}
              >
                <SelectTrigger className={selectedMaterials.length > 0 ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMaterials.length > 0 && (
                <p className="text-xs text-gray-500">Category is auto-filled from material selection</p>
              )}
            </div>
            
            {/* Unit */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select 
                onValueChange={(v) => handleSelectChange('unit', v)} 
                value={formData.unit || ''}
                disabled={selectedMaterials.length > 0}
              >
                <SelectTrigger className={selectedMaterials.length > 0 ? 'bg-gray-100' : ''}>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {INVENTORY_UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedMaterials.length > 0 && (
                <p className="text-xs text-gray-500">Unit is auto-filled from material selection</p>
              )}
            </div>
            
            {/* Current Stock */}
            <div className="space-y-2">
              <Label htmlFor="current_stock">Current Stock *</Label>
              <Input 
                id="current_stock" 
                type="number" 
                min="0"
                value={formData.current_stock || ''} 
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            {/* Min Stock Threshold */}
            <div className="space-y-2">
              <Label htmlFor="stock_threshold_min">Min Stock Threshold *</Label>
              <Input 
                id="stock_threshold_min" 
                type="number" 
                min="0"
                value={formData.stock_threshold_min || ''} 
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            {/* Reorder Quantity */}
            <div className="space-y-2">
              <Label htmlFor="reorder_qty">Reorder Quantity *</Label>
              <Input 
                id="reorder_qty" 
                type="number" 
                min="0"
                value={formData.reorder_qty || ''} 
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>
            
            {/* Primary Supplier */}
            <div className="space-y-2">
              <Label htmlFor="primary_supplier_code">Primary Supplier</Label>
              <Select 
                onValueChange={(v) => {
                  console.log('Primary supplier selected:', v);
                  handleSelectChange('primary_supplier_code', v);
                }} 
                value={formData.primary_supplier_code || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Primary Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.supplier_code} value={s.supplier_code}>
                      {s.supplier_name} ({s.supplier_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.primary_supplier_code && (
                <p className="text-xs text-gray-500">
                  Selected: {formData.primary_supplier_code}
                </p>
              )}
            </div>
            
            {/* Backup Supplier */}
            <div className="space-y-2">
              <Label htmlFor="backup_supplier_code">Backup Supplier</Label>
              <Select 
                onValueChange={(v) => {
                  console.log('Backup supplier selected:', v);
                  handleSelectChange('backup_supplier_code', v);
                }} 
                value={formData.backup_supplier_code || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Backup Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.supplier_code} value={s.supplier_code}>
                      {s.supplier_name} ({s.supplier_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.backup_supplier_code && (
                <p className="text-xs text-gray-500">
                  Selected: {formData.backup_supplier_code}
                </p>
              )}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
          > 
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} 
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Category Material Selector Component
const CategoryMaterialSelector = ({ onMaterialsSelected, selectedMaterials }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialsList, setSelectedMaterialsList] = useState(selectedMaterials || []);

  // Group materials by category
  const materialsByCategory = useMemo(() => {
    const grouped = {};
    MATERIALS_LIST.forEach(material => {
      if (!grouped[material.category]) {
        grouped[material.category] = [];
      }
      grouped[material.category].push(material);
    });
    return grouped;
  }, []);

  // Filter materials based on search term
  const filteredMaterials = useMemo(() => {
    if (!selectedCategory) return [];
    
    const categoryMaterials = materialsByCategory[selectedCategory] || [];
    if (!searchTerm) return categoryMaterials;
    
    return categoryMaterials.filter(material =>
      material.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, searchTerm, materialsByCategory]);

  const handleMaterialToggle = (material) => {
    const isSelected = selectedMaterialsList.some(m => m.name === material.name);
    
    if (isSelected) {
      setSelectedMaterialsList(prev => prev.filter(m => m.name !== material.name));
    } else {
      setSelectedMaterialsList(prev => [...prev, material]);
    }
  };

  const handleConfirmSelection = () => {
    onMaterialsSelected(selectedMaterialsList);
  };

  const isMaterialSelected = (material) => {
    return selectedMaterialsList.some(m => m.name === material.name);
  };

  return (
    <div className="space-y-6">
      {/* Category Selection - Card Format */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Select Material Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {MATERIAL_CATEGORIES.map(category => (
            <div
              key={category}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedCategory === category
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 mb-1">
                    {category}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {materialsByCategory[category]?.length || 0} materials
                  </p>
                </div>
                {selectedCategory === category && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search within category */}
      {selectedCategory && (
        <div className="space-y-2">
          <Label htmlFor="search">Search Materials in {selectedCategory}</Label>
          <Input
            id="search"
            placeholder="Search materials in this category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Materials List */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Materials in {selectedCategory}
            </h3>
            <Badge variant="secondary">
              {selectedMaterialsList.length} selected
            </Badge>
          </div>
          
          <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
            {filteredMaterials.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? 'No materials found matching your search.' : 'No materials available in this category.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 p-3">
                {filteredMaterials.map((material, index) => (
                  <div
                    key={`${material.name}-${index}`}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isMaterialSelected(material)
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => handleMaterialToggle(material)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {material.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Unit: {material.unit}
                        </div>
                        {material.typicalSupplier && (
                          <div className="text-xs text-gray-400 mt-1">
                            Supplier: {material.typicalSupplier}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        {isMaterialSelected(material) && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Materials Summary */}
      {selectedMaterialsList.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-medium text-green-800">
              Selected Materials ({selectedMaterialsList.length})
            </h4>
            <Badge variant="secondary" className="text-xs">
              Category: {selectedCategory}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedMaterialsList.map((material, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {material.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => {
            setSelectedMaterialsList([]);
            setSelectedCategory('');
            setSearchTerm('');
          }}
        >
          Clear All
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onMaterialsSelected([])}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={selectedMaterialsList.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Confirm Selection ({selectedMaterialsList.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

// Separate Material Selector Modal Component
const MaterialSelectorModal = ({ open, onClose, onMaterialsSelected, selectedMaterials }) => {
  if (!open) return null;

  const handleMaterialsSelected = (materials) => {
    console.log('MaterialSelectorModal - Direct callback called with:', materials);
    onMaterialsSelected(materials);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
      >
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Materials by Category</h2>
              <p className="text-sm text-gray-600 mt-1">Choose a category and select materials to add to your inventory</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-xl">×</span>
            </Button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)] bg-white">
          <CategoryMaterialSelector
            onMaterialsSelected={handleMaterialsSelected}
            selectedMaterials={selectedMaterials}
          />
        </div>
      </motion.div>
    </div>
  );
};

const ImportDialog = ({ onUpdate, onImportComplete }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [importType, setImportType] = useState('suppliers');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const importOrder = ['suppliers', 'inventory_items', 'material_purchases', 'grn', 'gin', 'stock_movements'];
  const tableMap = {
    suppliers: 'suppliers',
    inventory_items: 'inventory_items',
    material_purchases: 'material_purchases',
    grn: 'grn',
    gin: 'gin',
    stock_movements: 'stock_movements'
  };
  const conflictMap = {
      suppliers: 'supplier_code',
      inventory_items: 'material_code',
      material_purchases: 'purchase_id',
      grn: 'grn_id',
      gin: 'gin_id',
      stock_movements: 'movement_id',
  };

  const handleImport = () => {
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.toLowerCase().replace(/ /g, '_'),
      complete: async (results) => {
        const { data } = results;
        const tableName = tableMap[importType];
        const conflictColumn = conflictMap[importType];

        let processedData = data.map(row => {
           let newRow = {...row};
           if (newRow.categories_served && typeof newRow.categories_served === 'string') {
              newRow.categories_served = newRow.categories_served.split(',').map(s => s.trim());
           }
           // Convert numeric fields
           Object.keys(newRow).forEach(key => {
             if (['stock_threshold_min', 'reorder_qty', 'quantity', 'unit_price', 'qty_received', 'qty_issued'].includes(key)) {
                 newRow[key] = Number(newRow[key]) || 0;
             }
           });
           return newRow;
        });

        const { error } = await supabase.from(tableName).upsert(processedData, { onConflict: conflictColumn });
        
        setLoading(false);
        if (error) {
          toast({ title: t('inventory.import_error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: t('inventory.import_success'), description: `${data.length} records imported to ${tableName}.` });
          onUpdate(); // General refresh
          if(onImportComplete) onImportComplete(); // Specific callback
          setOpen(false);
          setFile(null);
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-2 h-4 w-4" />{t('inventory.import_data')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('inventory.import_dialog_title')}</DialogTitle>
          <DialogDescription>{t('inventory.import_dialog_desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>{t('inventory.import_type')}</Label>
          <Select value={importType} onValueChange={setImportType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
            {importOrder.map(type => <SelectItem key={type} value={type}>{t(`inventory.import_${type}`)}</SelectItem>)}
          </SelectContent></Select></div>
          <div className="space-y-2"><Label>{t('inventory.upload_file')}</Label><Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} /></div>
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={!file || loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('inventory.importing')}</> : t('inventory.import_data')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InventoryPage = () => {
  const { t, i18n } = useTranslation(['custom', 'translation']);
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', supplier: 'all', stock: 'all' });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, suppliersData] = await Promise.all([
        domusDbApi.getInventoryItems(),
        domusDbApi.getSuppliers()
      ]);

      // Manually join supplier names for display
      const processedItems = itemsData.map(item => ({
        ...item,
        primary_supplier: suppliersData.find(s => s.supplier_code === item.primary_supplier_code),
        backup_supplier: suppliersData.find(s => s.supplier_code === item.backup_supplier_code),
      }));

      setItems(processedItems);
      setSuppliers(suppliersData);
    } catch (error) {
      toast({ title: "Error fetching data", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const categoryMatch = filters.category === 'all' || item.category === filters.category;
      const supplierMatch = filters.supplier === 'all' || item.primary_supplier_code === filters.supplier;
      const stockMatch = filters.stock === 'all' || (filters.stock === 'low' ? item.current_stock < item.stock_threshold_min : item.current_stock >= item.stock_threshold_min);
      return categoryMatch && supplierMatch && stockMatch;
    });
  }, [items, filters]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormOpen(true);
  };
  
  const handleAdd = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    const { error } = await supabase.from('inventory_items').delete().eq('id', selectedItem.id);
    if (error) {
      toast({ title: t('inventory.import_error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('inventory.import_success'), description: "Item deleted." });
      fetchData();
    }
    setDeleteAlertOpen(false);
  };

  const handleMaterialSelected = (materials) => {
    setSelectedMaterials(materials);
    setShowMaterialSelector(false);
  };

  const handleAddMultipleMaterials = async () => {
    setLoading(true);
    try {
      for (const material of selectedMaterials) {
        const payload = {
          material_name: material.name,
          category: material.category,
          unit: material.unit,
          current_stock: 0,
          stock_threshold_min: 0,
          reorder_qty: 0,
          primary_supplier_code: '',
          backup_supplier_code: ''
        };
        
        const { error } = await supabase.from('inventory_items').insert([payload]);
        if (error) {
          console.error('Error adding material:', material.name, error);
        }
      }
      
      toast({ 
        title: 'Success', 
        description: `Added ${selectedMaterials.length} materials to inventory.`,
        variant: 'default'
      });
      
      fetchData();
      setSelectedMaterials([]);
      setFormOpen(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to add some materials.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('inventory.title', { ns: 'custom' })} - DomusBuilder Hub</title>
        <meta name="description" content={t('inventory.description', { ns: 'custom' })} />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div><h1 className="text-3xl font-bold text-gray-800">{t('inventory.title')}</h1><p className="text-gray-500 mt-1">{t('inventory.description')}</p></div>
          <div className="flex gap-2">
            <ImportDialog onUpdate={fetchData} />
            <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />{t('inventory.add_item')}</Button>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filters.category} onValueChange={(v) => setFilters(f => ({...f, category: v}))}><SelectTrigger><SelectValue placeholder={t('inventory.filter_by_category')} /></SelectTrigger><SelectContent><SelectItem value="all">{t('inventory.all_categories')}</SelectItem>{MATERIAL_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.supplier} onValueChange={(v) => setFilters(f => ({...f, supplier: v}))}><SelectTrigger><SelectValue placeholder={t('inventory.filter_by_supplier')} /></SelectTrigger><SelectContent><SelectItem value="all">{t('inventory.all_suppliers')}</SelectItem>{suppliers.map(s => <SelectItem key={s.supplier_code} value={s.supplier_code}>{s.supplier_name}</SelectItem>)}</SelectContent></Select>
          <Select value={filters.stock} onValueChange={(v) => setFilters(f => ({...f, stock: v}))}><SelectTrigger><SelectValue placeholder={t('inventory.filter_by_stock')} /></SelectTrigger><SelectContent><SelectItem value="all">{t('inventory.all_stock')}</SelectItem><SelectItem value="low">{t('inventory.low_stock')}</SelectItem><SelectItem value="in_stock">{t('inventory.in_stock')}</SelectItem></SelectContent></Select>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material Code</TableHead>
                <TableHead>Material Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Min Stock</TableHead>
                <TableHead>Reorder Qty</TableHead>
                <TableHead>Primary Supplier</TableHead>
                <TableHead>Backup Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="10" className="text-center py-8">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="10" className="text-center py-8 text-gray-500">
                    No inventory items found. Add your first item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.material_code ? 'secondary' : 'outline'}
                          className="font-mono text-xs"
                        >
                          {item.material_code || 'No Code'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="max-w-[200px] truncate" title={item.material_name}>
                        {item.material_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{item.current_stock || 0}</span>
                        <span className="text-gray-500 text-sm">{item.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.stock_threshold_min || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{item.reorder_qty || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {item.primary_supplier?.supplier_name || item.primary_supplier_code || 'Not Set'}
                        {item.primary_supplier?.website && (
                          <a 
                            href={item.primary_supplier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <LinkIcon className="h-3 w-3 inline" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate">
                        {item.backup_supplier?.supplier_name || item.backup_supplier_code || 'Not Set'}
                        {item.backup_supplier?.website && (
                          <a 
                            href={item.backup_supplier.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <LinkIcon className="h-3 w-3 inline" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.current_stock < item.stock_threshold_min && item.stock_threshold_min > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(item)}
                          className="h-8"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDelete(item)}
                          className="h-8"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
      <InventoryItemForm 
        open={formOpen} 
        setOpen={setFormOpen} 
        item={selectedItem} 
        suppliers={suppliers} 
        onUpdate={fetchData}
        showMaterialSelector={showMaterialSelector}
        setShowMaterialSelector={setShowMaterialSelector}
        selectedMaterials={selectedMaterials}
        setSelectedMaterials={setSelectedMaterials}
      />
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{t('inventory.delete_confirm_title')}</AlertDialogTitle><AlertDialogDescription>{t('inventory.delete_confirm_desc')}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>{t('materials.cancel')}</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>{t('inventory.delete')}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Material Selector Modal */}
      <MaterialSelectorModal
        open={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        onMaterialsSelected={handleMaterialSelected}
        selectedMaterials={selectedMaterials}
      />
      
    </>
  );
};

export default InventoryPage;