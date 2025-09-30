import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PackagePlus, Edit, Check, ChevronsUpDown, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { useTranslation } from 'react-i18next';
import ReceiveMaterialForm from '@/components/inventory/ReceiveMaterialForm';
import UseMaterialForm from '@/components/inventory/UseMaterialForm';
import { MATERIAL_CATEGORIES } from '@/lib/constants.js';
import { domusDbApi } from '@/api/domusDbApi';

const MaterialsTab = ({ projects, handleFeatureClick }) => {
    const { toast } = useToast();
    const { t } = useTranslation();
    const { hasPermission } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState([]);
    
    const canUpdate = hasPermission('tasks:edit'); // Using 'tasks:edit' as proxy for Contractor role

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getProjectMaterials();
            const suppliers = await domusDbApi.getSuppliers();

            const processedData = data.map(item => ({
                ...item,
                primary_supplier: suppliers.find(s => s.supplier_code === item.primary_supplier_code),
            }));

            if (projects.length > 0) {
                const projectCodes = projects.map(p => p.project_code);
                const filteredByProject = processedData.filter(m => projectCodes.includes(m.project_code));
                setMaterials(filteredByProject);
            } else {
                setMaterials(processedData);
            }
        } catch (error) {
            toast({ title: "Error fetching materials", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [projects, toast]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleFilterToggle = (category) => {
        setActiveFilters(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    const filteredMaterials = useMemo(() => {
        if (activeFilters.length === 0) return materials;
        return materials.filter(m => activeFilters.includes(m.material_category));
    }, [materials, activeFilters]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Ordered': return 'text-blue-600 bg-blue-100';
            case 'Delivered': return 'text-green-600 bg-green-100';
            case 'Partially Used': return 'text-orange-600 bg-orange-100';
            case 'Used': return 'text-gray-600 bg-gray-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{t('inventory.title', { ns: 'custom' })}</h2>
                    <p className="text-gray-600">{t('inventory.description', { ns: 'custom' })}</p>
                </div>
                {canUpdate && (
                    <Button onClick={() => handleFeatureClick("Add Material to Project")}>
                        <PackagePlus className="mr-2 h-4 w-4" /> {t('inventory.add_material', { ns: 'custom' })}
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-sm text-gray-700">{t('inventory.filter_by_category', { ns: 'custom' })}:</span>
                        {MATERIAL_CATEGORIES.map(category => (
                            <Button 
                                key={category}
                                variant={activeFilters.includes(category) ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => handleFilterToggle(category)}
                                className={`h-8 rounded-full ${activeFilters.includes(category) ? 'bg-blue-100 text-blue-800' : ''}`}
                            >
                                {category}
                            </Button>
                        ))}
                        {activeFilters.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])} className="text-red-500 hover:text-red-600 h-8">
                                <X className="mr-1 h-4 w-4" /> Clear
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.material', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.project', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.status', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.estimated_qty', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.current_qty', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.unit_cost', { ns: 'custom' })}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.total_cost', { ns: 'custom' })}</th>
                                {canUpdate && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.table.actions', { ns: 'custom' })}</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {loading ? (
                                <tr>
                                    <td colSpan={canUpdate ? "8" : "7"} className="text-center py-10 text-gray-500">
                                        <div className="flex justify-center items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-600"></div>
                                            <span>{t('inventory.loading', { ns: 'custom' })}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredMaterials.length > 0 ? (
                                filteredMaterials.map(material => (
                                    <tr key={material.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{material.material_name}</div>
                                            <div className="text-sm text-gray-500">{material.material_category}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.project_name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge className={`${getStatusBadge(material.status)}`} variant="secondary">
                                                {t(`inventory.status.${material.status.toLowerCase().replace(' ', '_')}`, { ns: 'custom' })}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.estimated_qty} {material.material_unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{material.current_qty} {material.material_unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(material.unit_cost || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${(material.current_qty * (material.unit_cost || 0)).toFixed(2)}</td>
                                        {canUpdate && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <ReceiveMaterialForm inventoryItem={material} onUpdate={fetchMaterials} />
                                                <UseMaterialForm inventoryItem={material} onUpdate={fetchMaterials} />
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={canUpdate ? "8" : "7"} className="text-center py-10 text-gray-500">
                                        {t('inventory.no_materials', { ns: 'custom' })}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default MaterialsTab;