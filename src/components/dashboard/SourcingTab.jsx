import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddMaterialDialog } from './sourcing/AddMaterialDialog';
import { AddPriceQuoteDialog } from './sourcing/AddPriceQuoteDialog';
import { SourcingTable } from './sourcing/SourcingTable';

const SourcingTab = ({ projects, updateProjects }) => {
    const [addMaterialOpen, setAddMaterialOpen] = useState(false);
    const [addPriceOpen, setAddPriceOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const allMaterials = useMemo(() => {
        return projects.flatMap(p =>
            p.materials ? p.materials.map(m => ({ ...m, projectName: p.name, projectId: p.id, team: p.team || [], suppliers: p.suppliers || [], material_prices: p.material_prices || [] })) : []
        );
    }, [projects]);

    const handleAddPriceClick = (material) => {
        setSelectedMaterial(material);
        setAddPriceOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Material Sourcing & Delivery</h2>
                    <p className="text-gray-600">Plan material deliveries and compare supplier prices.</p>
                </div>
                <Button onClick={() => setAddMaterialOpen(true)}>
                    <PackagePlus className="mr-2 h-4 w-4" /> Add Material
                </Button>
            </div>

            <SourcingTable materials={allMaterials} onAddPriceClick={handleAddPriceClick} />

            <AddMaterialDialog 
                isOpen={addMaterialOpen} 
                onOpenChange={setAddMaterialOpen} 
                projects={projects} 
                updateProjects={updateProjects}
            />

            <AddPriceQuoteDialog 
                isOpen={addPriceOpen} 
                onOpenChange={setAddPriceOpen} 
                selectedMaterial={selectedMaterial} 
            />
        </motion.div>
    );
};

export default SourcingTab;