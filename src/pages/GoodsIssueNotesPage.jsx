import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { domusDbApi } from '@/api/domusDbApi';

const STATUSES = ['Pending', 'Issued', 'Cancelled'];

const GINForm = ({ open, setOpen, gin, onUpdate }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                const [
                    materialsData, projectsData
                ] = await Promise.all([
                    domusDbApi.getInventoryItems(),
                    domusDbApi.getProjects(),
                ]);
                setMaterials(materialsData || []);
                setProjects(projectsData || []);
            };
            fetchData();
        }
    }, [open]);
    
    useEffect(() => {
        if (gin) {
            setFormData({ ...gin, date: gin.date ? format(new Date(gin.date), 'yyyy-MM-dd') : '' });
        } else {
            setFormData({ date: format(new Date(), 'yyyy-MM-dd'), status: 'Pending', qty_issued: 0 });
        }
    }, [gin, open]);

    const handleMaterialChange = (materialCode) => {
        const material = materials.find(m => m.material_code === materialCode);
        if(material){
            setFormData(p => ({ ...p, material_code: material.material_code, description: material.material_name, unit: material.unit }));
        }
    }
    
    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.id]: e.target.value }));
    const handleSelectChange = (id, value) => setFormData(p => ({ ...p, [id]: value }));

    const handleSubmit = async () => {
        setLoading(true);
        const selectedMaterial = materials.find(m => m.material_code === formData.material_code);
        if (selectedMaterial && Number(formData.qty_issued) > selectedMaterial.current_stock) {
            toast({ title: "Error", description: `Cannot issue more than available stock (${selectedMaterial.current_stock}).`, variant: "destructive" });
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            gin_id: formData.gin_id || `GIN-${String(Date.now()).slice(-6)}`,
            qty_issued: Number(formData.qty_issued),
        };
        delete payload.id;

        const { error } = gin?.id
            ? await supabase.from('gin').update(payload).eq('id', gin.id)
            : await supabase.from('gin').insert([payload]);

        if (error) {
            toast({ title: "Error", description: error.message, variant: 'destructive' });
        } else {
            toast({ title: "Success", description: "GIN saved." });
            onUpdate();
            setOpen(false);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{gin?.id ? 'Edit' : 'Create'} Goods Issue Note</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2"><Label>Date</Label><Input id="date" type="date" value={formData.date || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Material</Label><Select onValueChange={handleMaterialChange}><SelectTrigger><SelectValue placeholder="Select Material" /></SelectTrigger><SelectContent>{materials.map(m => <SelectItem key={m.material_code} value={m.material_code}>{m.material_name} ({m.current_stock} available)</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Quantity Issued</Label><Input id="qty_issued" type="number" value={formData.qty_issued} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Project</Label><Select value={formData.project_code || ''} onValueChange={v => handleSelectChange('project_code', v)}><SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.project_code} value={p.project_code}>{p.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-2"><Label>Issued To</Label><Input id="issued_to" value={formData.issued_to || ''} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Issued By</Label><Input id="issued_by" value={formData.issued_by || ''} onChange={handleChange} /></div>
                    <div className="space-y-2 md:col-span-2"><Label>Notes</Label><Textarea id="notes" value={formData.notes || ''} onChange={handleChange} /></div>
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

const GoodsIssueNotesPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [gins, setGins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [selectedGin, setSelectedGin] = useState(null);

    const fetchGins = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getGoodsIssueNotes();
            // Manually join related data for display
            const inventoryItems = await domusDbApi.getInventoryItems();
            const projects = await domusDbApi.getProjects();

            const processedData = data.map(gin => {
                const material = inventoryItems.find(m => m.material_code === gin.material_code);
                const project = projects.find(p => p.project_code === gin.project_code);
                return {
                    ...gin,
                    description: material?.material_name || gin.description,
                    unit: material?.unit || gin.unit,
                    project_name: project?.name,
                };
            });
            setGins(processedData);
        } catch (error) {
            toast({ title: 'Error fetching GINs', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchGins(); }, [fetchGins]);
    
    const handleEdit = (gin) => { setSelectedGin(gin); setOpenForm(true); };
    const handleAdd = () => { setSelectedGin(null); setOpenForm(true); };
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const { error } = await supabase.from('gin').delete().eq('id', id);
        if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
        else { toast({ title: 'Success', description: 'GIN deleted.' }); fetchGins(); }
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Goods Issue Notes - DomusBuilder Hub</title>
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Goods Issue Notes (GIN)</h1>
                        <p className="text-gray-500">Track materials issued from inventory to project sites.</p>
                    </div>
                    <Button onClick={handleAdd}><PlusCircle className="mr-2 h-4 w-4" />Create GIN</Button>
                </div>

                 <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Date', 'GIN ID', 'Material', 'Qty Issued', 'Issued To', 'Status', 'Actions'].map(h =>
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? <tr><td colSpan="7" className="text-center py-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" /></td></tr>
                                    : gins.map(gin => (
                                        <tr key={gin.id}>
                                            <td className="px-6 py-4">{format(new Date(gin.date), 'PPP')}</td>
                                            <td className="px-6 py-4">{gin.gin_id}</td>
                                            <td className="px-6 py-4">{gin.description}</td>
                                            <td className="px-6 py-4">{gin.qty_issued} {gin.unit}</td>
                                            <td className="px-6 py-4">{gin.issued_to}</td>
                                            <td className="px-6 py-4"><Badge variant={gin.status === 'Issued' ? 'success' : 'secondary'}>{gin.status}</Badge></td>
                                            <td className="px-6 py-4 space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => handleEdit(gin)}><Edit className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(gin.id)}><Trash2 className="h-4 w-4" /></Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <GINForm open={openForm} setOpen={setOpenForm} gin={selectedGin} onUpdate={fetchGins} />
            </motion.div>
        </>
    );
};

export default GoodsIssueNotesPage;