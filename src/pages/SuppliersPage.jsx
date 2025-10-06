import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { domusDbApi } from '@/api/domusDbApi';
import { useProject } from '@/contexts/ProjectContext';

const SupplierForm = ({ open, setOpen, supplier, onSupplierUpdate }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { selectedProject } = useProject();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (supplier) {
            setFormData({ ...supplier, categories_served: supplier.categories_served?.join(', ') || '' });
        } else {
            setFormData({
                supplier_code: '',
                supplier_name: '',
                country: '',
                phone: '',
                website: '',
                categories_served: '',
            });
        }
    }, [supplier, open]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);

        const payload = {
            ...formData,
            categories_served: formData.categories_served ? formData.categories_served.split(',').map(s => s.trim()) : [],
            project_id: selectedProject?.id
        };
        delete payload.id;
        delete payload.created_at;

        let query;
        if (supplier?.id) {
            query = supabase.from('suppliers').update(payload).eq('id', supplier.id);
        } else {
            query = supabase.from('suppliers').insert(payload);
        }

        const { error } = await query;

        setLoading(false);
        if (error) {
            toast({ title: "Error saving supplier", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: `Supplier ${supplier?.id ? 'updated' : 'added'} successfully.` });
            onSupplierUpdate();
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{supplier?.id ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
                    <DialogDescription>
                        {supplier?.id ? 'Update the details for this supplier.' : 'Enter the details for the new supplier.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="supplier_code">Supplier Code</Label>
                        <Input id="supplier_code" value={formData.supplier_code || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supplier_name">Supplier Name</Label>
                        <Input id="supplier_name" value={formData.supplier_name || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={formData.country || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" value={formData.phone || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" value={formData.website || ''} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="categories_served">Categories Served (comma-separated)</Label>
                        <Input id="categories_served" value={formData.categories_served || ''} onChange={handleChange} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Supplier'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SuppliersPage = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { selectedProject } = useProject();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await domusDbApi.getSuppliers(selectedProject?.id);
      setSuppliers(data);
    } catch (error) {
      toast({ title: 'Error fetching suppliers', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, selectedProject?.id]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAdd = () => {
      if (!selectedProject) {
          toast({ title: 'No Project Selected', description: 'Please select a project before adding suppliers.', variant: 'destructive' });
          return;
      }
      setSelectedSupplier(null);
      setOpenForm(true);
  };
  
  const handleEdit = (supplier) => {
      setSelectedSupplier(supplier);
      setOpenForm(true);
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier? This may affect inventory items that reference it.')) {
        const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
        if (error) {
            toast({ title: 'Error deleting supplier', description: error.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Supplier deleted.' });
            fetchSuppliers();
        }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.toLowerCase().replace(/ /g, '_'),
        complete: async (results) => {
            const requiredFields = ['supplier_code', 'supplier_name'];
            const headers = results.meta.fields;
            const missingHeaders = requiredFields.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                toast({ title: 'Import Error', description: `CSV is missing required columns: ${missingHeaders.join(', ')}`, variant: 'destructive' });
                setIsImporting(false);
                return;
            }

            const dataToInsert = results.data.map(row => ({
                supplier_code: row.supplier_code,
                supplier_name: row.supplier_name,
                country: row.country,
                phone: row.phone,
                website: row.website,
                categories_served: row.categories_served ? row.categories_served.split(',').map(s => s.trim()) : null,
                project_id: selectedProject?.id,
            }));

            const { error } = await supabase.from('suppliers').upsert(dataToInsert, { onConflict: 'supplier_code' });

            setIsImporting(false);
            if (error) {
                toast({ title: 'Error during import', description: error.message, variant: 'destructive' });
            } else {
                toast({ title: 'Import Successful', description: `${dataToInsert.length} records imported.` });
                fetchSuppliers();
            }
        },
        error: (error) => {
            toast({ title: 'CSV Parsing Error', description: error.message, variant: 'destructive' });
            setIsImporting(false);
        }
    });
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>Supplier Directory - DomusBuilder Hub</title>
        <meta name="description" content="Manage your supplier directory and contacts." />
      </Helmet>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Supplier Directory</h1>
                <p className="text-gray-500">Manage your network of suppliers and vendors.</p>
                {selectedProject && (
                    <p className="text-sm text-blue-600 mt-1">Project: {selectedProject.name}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                    <Label htmlFor="csv-import">
                        <Upload className="mr-2 h-4 w-4"/>
                        {isImporting ? 'Importing...' : 'Import from CSV'}
                        <Input id="csv-import" type="file" className="hidden" accept=".csv" onChange={handleFileUpload} disabled={isImporting} />
                    </Label>
                </Button>
                <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4"/>Add Supplier</Button>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 text-blue-600"/></td></tr>
                        ) : suppliers.map(supplier => (
                            <tr key={supplier.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.supplier_code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.supplier_name}{supplier.website && <a href={supplier.website} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3 w-3 inline ml-2 text-blue-500"/></a>}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.country}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.categories_served?.join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(supplier)}><Edit className="h-4 w-4" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDelete(supplier.id)}><Trash2 className="h-4 w-4" /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <SupplierForm open={openForm} setOpen={setOpenForm} supplier={selectedSupplier} onSupplierUpdate={fetchSuppliers} />

      </motion.div>
    </>
  );
};

export default SuppliersPage;