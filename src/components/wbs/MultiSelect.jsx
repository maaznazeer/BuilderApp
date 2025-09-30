import React, { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const MultiSelect = ({ options, selected, onChange, placeholder, className }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue];
    onChange(newSelected);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between font-normal", className)}
        >
          <span className="truncate">
            {selected.length > 0
              ? selected.map(s => <Badge key={s} variant="secondary" className="mr-1">{s}</Badge>)
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
                <ScrollArea className="h-48">
                    {options.map((option) => (
                    <CommandItem
                        key={option}
                        value={option}
                        onSelect={() => handleSelect(option)}
                    >
                        <Check
                        className={cn(
                            'mr-2 h-4 w-4',
                            selected.includes(option) ? 'opacity-100' : 'opacity-0'
                        )}
                        />
                        {option}
                    </CommandItem>
                    ))}
                </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;