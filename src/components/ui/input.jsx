import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const Input = React.forwardRef(({ className, type, clearable, onClear, ...props }, ref) => {
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

  const handleInputChange = (e) => {
    setHasValue(e.target.value !== '');
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleClear = () => {
    const input = ref && ref.current;
    if (input) {
      const lastValue = input.value;
      input.value = '';
      const event = new Event('input', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      input.dispatchEvent(event);
      if (props.onChange) {
        props.onChange(event);
      }
    }
    setHasValue(false);
    if(onClear) onClear();
  };

  const wrapperClasses = cn(
    'relative flex items-center w-full',
    className
  );

  const inputClasses = cn(
    'flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    { 'pr-8': clearable }
  );

  return (
    <div className={wrapperClasses}>
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        onChange={handleInputChange}
        {...props}
      />
      {clearable && hasValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear input"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export { Input };