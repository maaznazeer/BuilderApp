import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { domusDbApi } from '@/api/domusDbApi';

const StockMovementsPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMovements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getStockMovements();
            // Manually join project names for display
            const projects = await domusDbApi.getProjects();
            const inventoryItems = await domusDbApi.getInventoryItems();

            const processedData = data.map(move => {
                const project = projects.find(p => p.project_code === move.project_code);
                const material = inventoryItems.find(m => m.material_code === move.material_code);
                return {
                    ...move,
                    projects: project,
                    description: material?.material_name || move.description,
                    unit: material?.unit || move.unit,
                };
            });
            setMovements(processedData);
        } catch (error) {
            toast({ title: 'Error fetching stock movements', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchMovements(); }, [fetchMovements]);

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Stock Movements - DomusBuilder Hub</title>
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Stock Movements</h1>
                        <p className="text-gray-500">A complete log of all inventory transactions.</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Project</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan="6" className="text-center py-8">
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
                                    </TableCell>
                                </TableRow>
                            ) : movements.map(move => (
                                <TableRow key={move.id}>
                                    <TableCell>{format(new Date(move.date), 'Pp')}</TableCell>
                                    <TableCell>
                                        <Badge variant={move.movement_type === 'IN' ? 'success' : 'destructive'}>
                                            {move.movement_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{move.description}</TableCell>
                                    <TableCell className={move.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                                        {move.quantity} {move.unit}
                                    </TableCell>
                                    <TableCell>{move.source}: {move.source_id}</TableCell>
                                    <TableCell>{move.projects?.name || move.project_code || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </motion.div>
        </>
    );
};

export default StockMovementsPage;