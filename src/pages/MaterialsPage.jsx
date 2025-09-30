import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import MaterialsHeader from '@/components/materials/MaterialsHeader.jsx';
import MaterialsTable from '@/components/materials/MaterialsTable.jsx';
import ActionDialog from '@/components/materials/ActionDialog.jsx';

const MaterialsPage = () => {
  const { t, i18n } = useTranslation('custom');
  const { toast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogState, setDialogState] = useState({ type: null, data: null });

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('material_inventory').select('*').order('material_name');
    if (error) {
      toast({ title: t('materials.error_fetching_materials'), description: error.message, variant: 'destructive' });
    } else {
      setMaterials(data);
    }
    setLoading(false);
  }, [toast, t]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const categories = useMemo(() => ['all', ...new Set(materials.map(m => m.category).filter(Boolean))], [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = material.material_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [materials, searchTerm, categoryFilter]);

  const handleAction = (type, data = null) => setDialogState({ type, data });
  const closeDialog = () => setDialogState({ type: null, data: null });
  const onActionSuccess = () => {
    fetchMaterials();
    closeDialog();
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('materials.title')} - DomusBuilder Hub</title>
        <meta name="description" content={t('materials.description')} />
      </Helmet>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="space-y-6"
      >
        <MaterialsHeader 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          onAdd={() => handleAction('add')}
        />
        <MaterialsTable 
          loading={loading}
          materials={filteredMaterials}
          onAction={handleAction}
        />
      </motion.div>

      <ActionDialog
        dialogState={dialogState}
        onClose={closeDialog}
        onSuccess={onActionSuccess}
      />
    </>
  );
};

export default MaterialsPage;