import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, ShoppingCart, Loader2, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useProject } from '@/contexts/ProjectContext.jsx';
import { format } from 'date-fns';
import { Combobox } from '@/components/ui/combobox';
import { domusDbApi } from '@/api/domusDbApi';

const STATUSES = ['Pending', 'Approved', 'Received'];

const PurchaseForm = ({ open, setOpen, purchase, onUpdate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { projects } = useProject();
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const totalAmount = useMemo(() => {
    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.unit_price);
    if (!isNaN(qty) && !isNaN(price)) {
      return (qty * price).toFixed(2);
    }
    return '0.00';
  }, [formData.quantity, formData.unit_price]);

  useEffect(() => {
    if (open) {
        const fetchData = async () => {
          const [
            suppliersData,
            materialsData
          ] = await Promise.all([
             domusDbApi.getSuppliers(),
             domusDbApi.getInventoryItems()
          ]);
          
          setSuppliers(suppliersData || []);
          setMaterials(materialsData ? materialsData.map(m => ({ value: m.material_name, label: m.material_name })) : []);
        };
        fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (purchase) {
      setFormData({ ...purchase, date: purchase.date ? format(new Date(purchase.date), 'yyyy-MM-dd') : '' });
    } else {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        quantity: 1,
        unit_price: 0,
        supplier_code: '',
        project_code: '',
        status: 'Pending',
      });
    }
  }, [purchase, open]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(p => ({ ...p, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData(p => ({ ...p, [id]: value }));
  };

  const handleSubmit = async () => {
    if (formData.quantity <= 0 || formData.unit_price < 0) {
        toast({ title: "Invalid Input", description: "Quantity must be positive and price cannot be negative.", variant: "destructive" });
        return;
    }
    if (!formData.description) {
      toast({ title: "Invalid Input", description: "Please select or enter a material description.", variant: "destructive" });
      return;
    }
    if (!formData.supplier_code) {
        toast({ title: "Invalid Input", description: "Please select a supplier.", variant: "destructive" });
        return;
    }
    setLoading(true);

    const purchase_id = formData.purchase_id || `PUR-${String(Date.now()).slice(-6)}`;
    
    const payload = {
        date: formData.date,
        description: formData.description,
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
        total_amount: Number(totalAmount),
        supplier_code: formData.supplier_code,
        project_code: formData.project_code || null,
        status: formData.status,
        user_id: user.id,
        purchase_id: purchase_id,
    };
    
    const { error } = purchase?.id
      ? await supabase.from('material_purchases').update(payload).eq('id', purchase.id)
      : await supabase.from('material_purchases').insert([payload]);

    setLoading(false);
    if (error) {
      toast({ title: "Error saving purchase", description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Purchase ${purchase?.id ? 'updated' : 'created'} successfully` });
      onUpdate();
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{purchase?.id ? 'Edit Material Purchase' : 'New Material Purchase'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2"><Label htmlFor="date">Date</Label><Input id="date" type="date" value={formData.date || ''} onChange={handleChange} /></div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Combobox
                options={materials}
                value={formData.description || ''}
                onChange={(value) => handleSelectChange('description', value)}
                placeholder="Select or type material..."
                searchPlaceholder="Search material..."
                emptyPlaceholder="No material found. Type to add."
              />
            </div>
            <div className="space-y-2"><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} min="1" /></div>
            <div className="space-y-2"><Label htmlFor="unit_price">Unit Price</Label><Input id="unit_price" type="number" value={formData.unit_price || ''} onChange={handleChange} min="0" step="0.01" /></div>
            <div className="space-y-2"><Label htmlFor="supplier_code">Supplier</Label><Select value={formData.supplier_code || ''} onValueChange={(v) => handleSelectChange('supplier_code', v)}><SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.supplier_code} value={s.supplier_code}>{s.supplier_name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label htmlFor="project_code">Project (Optional)</Label><Select value={formData.project_code || ''} onValueChange={(v) => handleSelectChange('project_code', v)}><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger><SelectContent><SelectItem value="">None</SelectItem>{projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2 md:col-span-2"><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="md:col-span-2 mt-2 p-3 bg-gray-100 rounded-md">
                <Label>Total Amount</Label>
                <p className="text-2xl font-bold text-gray-800">${totalAmount}</p>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null} Save Purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const PurchaseCard = ({ purchase, onEdit, onDelete }) => {
    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-800",
        Approved: "bg-blue-100 text-blue-800",
        Received: "bg-green-100 text-green-800",
    };

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-lg shadow-sm border p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-gray-800">{purchase.description}</p>
                    <p className="text-sm text-gray-500">{purchase.purchase_id}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[purchase.status]}`}>{purchase.status}</span>
            </div>
            <div className="text-sm text-gray-600">
                <p><strong>Supplier:</strong> {purchase.suppliers?.supplier_name || 'N/A'}</p>
                <p><strong>Project:</strong> {purchase.projects?.name || 'N/A'}</p>
                <p><strong>Date:</strong> {format(new Date(purchase.date), 'PPP')}</p>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
                <p className="text-lg font-bold text-gray-900">${purchase.total_amount?.toLocaleString()}</p>
                <div className="space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(purchase)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(purchase.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
            </div>
        </motion.div>
    );
};

const MaterialPurchasesPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const fetchPurchases = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getMaterialPurchases();
            const suppliers = await domusDbApi.getSuppliers();
            const projectsData = await domusDbApi.getProjects();
            const projects = projectsData || [];

            const processedData = data.map(p => ({
                ...p,
                suppliers: suppliers.find(s => s.supplier_code === p.supplier_code),
                projects: projects.find(proj => proj.project_code === p.project_code)
            }));
            setPurchases(processedData);
        } catch (error) {
            toast({ title: "Error fetching purchases", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);
    
    const purchasesByStatus = useMemo(() => {
        return STATUSES.reduce((acc, status) => {
            acc[status] = purchases.filter(p => p.status === status);
            return acc;
        }, {});
    }, [purchases]);

    const handleAdd = () => {
        setSelectedPurchase(null);
        setFormOpen(true);
    };

    const handleEdit = (purchase) => {
        setSelectedPurchase(purchase);
        setFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this purchase?")) {
            const { error } = await supabase.from('material_purchases').delete().eq('id', id);
            if (error) {
                toast({ title: "Error deleting purchase", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Purchase deleted."});
                fetchPurchases();
            }
        }
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Material Purchases - DomusBuilder Hub</title>
                <meta name="description" content="Track and manage material purchases for your projects." />
            </Helmet>
            <div className="space-y-6 p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Material Purchases</h1>
                        <p className="text-gray-500 mt-1">Track your procurement pipeline from pending to received.</p>
                    </div>
                    <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />New Purchase</Button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <AnimatePresence>
                        {STATUSES.map(status => (
                            <Card key={status} className="bg-gray-50/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ShoppingCart className="h-5 w-5"/> 
                                        {status} 
                                        <span className="text-sm font-normal text-gray-500 bg-gray-200 rounded-full px-2">{purchasesByStatus[status]?.length || 0}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {purchasesByStatus[status]?.length > 0 ? (
                                        purchasesByStatus[status].map(p => <PurchaseCard key={p.id} purchase={p} onEdit={handleEdit} onDelete={handleDelete}/>)
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">No purchases in this state.</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <PurchaseForm open={formOpen} setOpen={setFormOpen} purchase={selectedPurchase} onUpdate={fetchPurchases} />
        </>
    );
};

export default MaterialPurchasesPage;