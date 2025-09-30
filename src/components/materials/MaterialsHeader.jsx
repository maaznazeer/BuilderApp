import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

const MaterialsHeader = ({ searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, categories, onAdd }) => {
  const { t } = useTranslation('custom');

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('materials.title')}</h1>
          <p className="text-gray-500 mt-1">{t('materials.description')}</p>
        </div>
        <Button onClick={onAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />{t('materials.add_material')}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t('materials.search_placeholder')}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('materials.filter_category')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat === 'all' ? t('materials.all_categories') : cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default MaterialsHeader;