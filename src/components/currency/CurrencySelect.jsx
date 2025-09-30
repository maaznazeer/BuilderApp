import React from 'react';
import { useFX } from '@/contexts/CurrencyProvider';

export default function CurrencySelect(){
  const { currency, setCurrency } = useFX();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Currency</span>
      <select value={currency} onChange={e => setCurrency(e.target.value)} className="h-9 rounded-xl border px-3 text-sm">
        {['USD','EUR','XAF','XOF','ZAR'].map(c=> <option key={c} value={c}>{c}</option>)}
      </select>
    </div>
  );
}