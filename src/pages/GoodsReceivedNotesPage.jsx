import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { domusDbApi } from '@/api/domusDbApi';

const STATUSES = ['Pending', 'Received', 'Cancelled'];

const GRNForm = ({ open, setOpen, grn, onUpdate }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const [
                    purchasesData, suppliersData, materialsData, projectsData
                ] = await Promise.all([
                    domusDbApi.getMaterialPurchases(),
                    domusDbApi.getSuppliers(),
                    domusDbApi.getInventoryItems(),
                    domusDbApi.getProjects(),
                ]);
                setPurchases(purchasesData || []);
                setSuppliers(suppliersData || []);
                setMaterials(materialsData || []);
                setProjects(projectsData || []);
            };
            fetchData();
        }
    }, [open]);

    useEffect(() => {
        if (grn) {
            setFormData({ ...grn, date: grn.date ? format(new Date(grn.date), 'yyyy-MM-dd') : '' });
        } else {
            setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                status: 'Pending',
                qty_received: 0,
                unit_price: 0
            });
        }
    }, [grn, open]);
    
    const handlePurchaseChange = async (purchaseId) => {
        const data = purchases.find(p => p.purchase_id === purchaseId);
        if(data) {
            const material = materials.find(m => m.material_name === data.description);
            setFormData(prev => ({
                ...prev,
                purchase_id: data.purchase_id,
                description: data.description,
                supplier_code: data.supplier_code,
                project_code: data.project_code,
                unit_price: data.unit_price,
                qty_received: data.quantity,
                material_code: material?.material_code,
                unit: material?.unit,
            }));
        }
    };

    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));
    const handleSelectChange = (id, value) => setFormData(p => ({ ...p, [id]: value }));

    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            ...formData,
            grn_id: formData.grn_id || `GRN-${String(Date.now()).slice(-6)}`,
            qty_received: Number(formData.qty_received),
            unit_price: Number(formData.unit_price),
        };
        delete payload.id;
        
        const { error } = grn?.id
            ? await supabase.from('grn').update(payload).eq('id', grn.id)
            : await supabase.from('grn').insert([payload]);

        if (error) {
            toast({ title: "Error", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: "Success", description: "GRN saved." });
            onUpdate();
            setOpen(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{grn?.id ? 'Edit' : 'Create'} Goods Received Note</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2"><Label>Date</Label><Input id="date" type="date" value={formData.date || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>PO Number (Optional)</Label><Select onValueChange={handlePurchaseChange}><SelectTrigger><SelectValue placeholder="Link to PO" /></SelectTrigger><SelectContent>{purchases.map(p => <SelectItem key={p.purchase_id} value={p.purchase_id}>{p.purchase_id} ({p.description})</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Supplier</Label><Select value={formData.supplier_code || ''} onValueChange={v => handleSelectChange('supplier_code', v)}><SelectTrigger><SelectValue placeholder="Select Supplier" /></SelectTrigger><SelectContent>{suppliers.map(s => <SelectItem key={s.supplier_code} value={s.supplier_code}>{s.supplier_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Material</Label><Select value={formData.material_code || ''} onValueChange={v => handleSelectChange('material_code', v)}><SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger><SelectContent>{materials.map(m => <SelectItem key={m.material_code} value={m.material_code}>{m.material_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Description</Label><Input id="description" value={formData.description || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Quantity Received</Label><Input id="qty_received" type="number" value={formData.qty_received} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Unit Price</Label><Input id="unit_price" type="number" value={formData.unit_price} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Project</Label><Select value={formData.project_code || ''} onValueChange={v => handleSelectChange('project_code', v)}><SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Location</Label><Input id="location" value={formData.location || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Quality Check</Label><Input id="quality_check" value={formData.quality_check || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Received By</Label><Input id="received_by" value={formData.received_by || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status || ''} onValueChange={v => handleSelectChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>{loading ? <Loader2 className="animate-spin mr-2" /> : null} Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const GoodsReceivedNotesPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [grns, setGrns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedGrn, setSelectedGrn] = useState(null);

    const fetchGrns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getGoodsReceivedNotes();
            // Manually join related data for display
            const purchases = await domusDbApi.getMaterialPurchases();
            const suppliers = await domusDbApi.getSuppliers();
            const inventoryItems = await domusDbApi.getInventoryItems();

            const processedData = data.map(grn => {
                const purchase = purchases.find(p => p.purchase_id === grn.purchase_id);
                const supplier = suppliers.find(s => s.supplier_code === grn.supplier_code);
                const material = inventoryItems.find(m => m.material_code === grn.material_code);
                return {
                    ...grn,
                    purchase_id: purchase?.purchase_id || grn.purchase_id, // Keep original if not found
                    supplier_name: supplier?.supplier_name,
                    material_name: material?.material_name,
                    unit: material?.unit,
                    line_total: grn.qty_received * grn.unit_price,
                };
            });
            setGrns(processedData);
        } catch (error) {
            toast({ title: 'Error fetching GRNs', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchGrns(); }, [fetchGrns]);

    const handleEdit = (grn) => { setSelectedGrn(grn); setOpenForm(true); };
    const handleAdd = () => { setSelectedGrn(null); setOpenForm(true); };
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const { error } = await supabase.from('grn').delete().eq('id', id);
        if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Success', description: 'GRN deleted.' }); fetchGrns(); }
    };
    
    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Goods Received Notes - DomusBuilder Hub</title>
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Goods Received Notes (GRN)</h1>
                        <p className="text-gray-500">Log all incoming materials to your inventory.</p>
                    </div>
                    <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />Create GRN</Button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Date', 'GRN ID', 'PO ID', 'Material', 'Qty Received', 'Line Total', 'Status', 'Actions'].map(h =>
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? <tr><td colSpan="8" className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></td></tr>
                                    : grns.map(grn => (
                                        <tr key={grn.id}>
                                            <td className="px-6 py-4">{format(new Date(grn.date), 'PPP')}</td>
                                            <td className="px-6 py-4">{grn.grn_id}</td>
                                            <td className="px-6 py-4">{grn.purchase_id}</td>
                                            <td className="px-6 py-4">{grn.material_name || grn.description}</td>
                                            <td className="px-6 py-4">{grn.qty_received} {grn.unit}</td>
                                            <td className="px-6 py-4">${grn.line_total?.toLocaleString()}</td>
                                            <td className="px-6 py-4"><Badge variant={grn.status === 'Received' ? 'success' : 'secondary'}>{grn.status}</Badge></td>
                                            <td className="px-6 py-4 space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(grn)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(grn.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <GRNForm open={openForm} setOpen={setOpenForm} grn={selectedGrn} onUpdate={fetchGrns} />
            </motion.div>
        </>
    );
};

export default GoodsReceivedNotesPage;