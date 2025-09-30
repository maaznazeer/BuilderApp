import React, { useState, useMemo, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MATERIALS_LIST } from '@/lib/constants';

export const MaterialMultiSelect = ({ selectedMaterials, setSelectedMaterials }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const materialsOptions = useMemo(() => {
    const filtered = MATERIALS_LIST.filter(({ name }) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(({ name, category, unit }) => ({ label: name, value: name, category, unit }));

    // Add "Other" option if search term doesn't match any existing material
    if (searchTerm && !MATERIALS_LIST.some(m => m.name.toLowerCase() === searchTerm.toLowerCase())) {
      filtered.unshift({ label: `Add "${searchTerm}" as new material`, value: 'other', category: 'General', unit: 'unit' });
    }
    
    return filtered;
  }, [searchTerm]);

  const handleSelect = (materialValue) => {
    const material = materialsOptions.find(m => m.value === materialValue);
    if (!material) return;

    if (material.value === 'other') {
      setSelectedMaterials(prev => [...prev, { label: `Other: ${searchTerm}`, value: `other_${searchTerm}`, category: material.category, unit: material.unit }]);
      setSearchTerm('');
      setOpen(false);
    } else {
      if (!selectedMaterials.some(m => m.value === material.value)) {
        setSelectedMaterials(prev => [...prev, material]);
        setSearchTerm('');
        setOpen(false);
      } else {
        setSelectedMaterials(prev => prev.filter(m => m.value !== materialValue));
      }
    }
  };

  const handleRemove = (materialValue) => {
    setSelectedMaterials(prev => prev.filter(m => m.value !== materialValue));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="materials">Materials</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px] flex-wrap"
          >
            {selectedMaterials.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedMaterials.map(material => (
                  <Badge key={material.value} variant="secondary" className="flex items-center">
                    {material.label}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(material.value);
                      }}
                      className="ml-1 text-xs text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              "Select materials..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput
              placeholder="Search materials..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty>No material found.</CommandEmpty>
            <CommandGroup>
              {materialsOptions.map((material) => (
                <CommandItem
                  key={material.value}
                  value={material.value}
                  onSelect={() => handleSelect(material.value)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedMaterials.some(m => m.value === material.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {material.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};