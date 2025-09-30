import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { domusDbApi } from '@/api/domusDbApi';

const SuppliersTab = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchTopSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await domusDbApi.getSuppliers();
            // Sort and limit client-side for simplicity, or add order/limit to API call if supported
            const sortedSuppliers = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
            setSuppliers(sortedSuppliers);
        } catch (error) {
            toast({ title: "Error fetching suppliers", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTopSuppliers();
    }, [fetchTopSuppliers]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Suppliers</h1>
                    <p className="text-lg text-gray-600 mt-1">
                        An overview of your most recently added suppliers.
                    </p>
                </div>
                 <Button onClick={() => navigate('/suppliers')}>
                    View All Suppliers
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </motion.div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recently Added Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <p>Loading suppliers...</p>
                    ) : suppliers.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {suppliers.map((supplier) => (
                                <li key={supplier.id} className="py-4 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">{supplier.supplier_name}</p>
                                        <p className="text-sm text-gray-500">{supplier.contact_name} - {supplier.phone}</p>
                                    </div>
                                    ```javascript
                                    <p className="text-sm text-gray-500">{supplier.categories_served?.join(', ')}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">You haven't added any suppliers yet.</p>
                             <Button onClick={() => navigate('/suppliers')}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add First Supplier
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default SuppliersTab;