import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const FXCtx = createContext({ currency: 'USD', setCurrency: () => {}, rates: { USD: 1 } });

export default function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(localStorage.getItem('ccy') || 'USD');
  const [rates, setRates] = useState({ USD: 1 });

  useEffect(() => { localStorage.setItem('ccy', currency) }, [currency]);

  useEffect(() => {
    supabase.from('exchange_rates').select('currency_code, units_per_usd').then(({ data }) => {
      const map = {};
      if (data) {
        data.forEach(r => { map[r.currency_code] = Number(r.units_per_usd) });
      }
      if(!map['USD']) map['USD'] = 1;
      setRates(map);
    });
  },[]);

  return <FXCtx.Provider value={{ currency, setCurrency, rates }}>{children}</FXCtx.Provider>;
}

export const useFX = () => useContext(FXCtx);