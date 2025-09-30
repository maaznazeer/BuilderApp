import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

const NumberInput = React.forwardRef(
  ({ className, min, max, step = 1, onValueChange, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue || min || 0);

    const handleValueChange = (newValue) => {
      const clampedValue = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, newValue));
      setValue(clampedValue);
      if (onValueChange) {
        onValueChange(clampedValue);
      }
    };

    const handleInputChange = (e) => {
      const numValue = e.target.value === '' ? min || 0 : parseInt(e.target.value, 10);
      if (!isNaN(numValue)) {
        handleValueChange(numValue);
      }
    };

    const increment = () => {
      handleValueChange(value + step);
    };

    const decrement = () => {
      handleValueChange(value - step);
    };

    return (
      <div className={cn('relative flex items-center w-full max-w-[120px]', className)}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-full rounded-r-none border-r-0"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          ref={ref}
          type="number"
          className="rounded-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          {...props}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-full rounded-l-none border-l-0"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

export { NumberInput };