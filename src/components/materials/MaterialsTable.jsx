import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Edit, PackagePlus, PackageMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MaterialsTable = ({ loading, materials, onAction }) => {
  const { t } = useTranslation('custom');

  const getStatus = (currentStock, threshold, reorderQty) => {
    if (currentStock <= threshold) {
      return { label: t('materials.status_low'), color: 'bg-red-100 text-red-800' };
    }
    if (currentStock <= threshold + (reorderQty || 0)) {
      return { label: t('materials.status_reorder'), color: 'bg-yellow-100 text-yellow-800' };
    }
    return { label: t('materials.status_in_stock'), color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.unit')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.supplier')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.price')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.stock')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.threshold')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.status')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('materials.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-8">Loading...</td></tr>
              ) : materials.map(material => (
                <motion.tr key={material.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.material_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.primary_supplier?.supplier_name || material.primary_supplier_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${material.estimated_price?.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.current_stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.stock_threshold_min}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatus(material.current_stock, material.stock_threshold_min, material.reorder_qty).color}`}>
                      {getStatus(material.current_stock, material.stock_threshold_min, material.reorder_qty).label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onAction('po', material)}><PackagePlus className="h-4 w-4 mr-1" />{t('materials.add_to_po')}</Button>
                    <Button size="sm" variant="outline" onClick={() => onAction('use', material)}><PackageMinus className="h-4 w-4 mr-1" />{t('materials.mark_used')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => onAction('edit', material)}><Edit className="h-4 w-4" /></Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialsTable;