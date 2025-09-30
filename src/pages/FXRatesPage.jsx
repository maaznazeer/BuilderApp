import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const FXRatesPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentRate, setCurrentRate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fx_rates')
      .select('*')
      .order('currency', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching rates', description: error.message });
    } else {
      setRates(data || []);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleOpenDialog = (rate = null) => {
    setCurrentRate(rate || { currency: '', rate_to_base: '', base_currency: 'XAF', id: null });
    setIsDialogOpen(true);
  };

  const handleSaveRate = async () => {
    if (!currentRate.currency || !currentRate.rate_to_base) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Currency and Rate are required.' });
      return;
    }

    setIsSaving(true);
    
    const rateData = {
      currency: currentRate.currency,
      rate_to_base: parseFloat(currentRate.rate_to_base),
      base_currency: currentRate.base_currency || 'XAF',
      user_id: user.id,
      as_of: new Date().toISOString().split('T')[0],
    };
    
    let query;
    if (currentRate.id) {
        query = supabase.from('fx_rates').update(rateData).eq('id', currentRate.id);
    } else {
        query = supabase.from('fx_rates').upsert(rateData, { onConflict: 'currency' });
    }

    const { error } = await query;
    
    setIsSaving(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Error saving rate', description: error.message });
    } else {
      toast({ title: 'Rate saved!', description: `The rate for ${currentRate.currency} has been updated.` });
      setIsDialogOpen(false);
      setCurrentRate(null);
      fetchRates();
    }
  };

  const handleDeleteRate = async (rateId) => {
    const { error } = await supabase.from('fx_rates').delete().eq('id', rateId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error deleting rate', description: error.message });
    } else {
      toast({ title: 'Rate deleted!', description: 'The exchange rate has been removed.' });
      fetchRates();
    }
  };

  return (
    <>
      <Helmet>
        <title>FX Rates Management - DomusBuilder Hub</title>
        <meta name="description" content="Manage currency exchange rates for financial reporting." />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6 lg:p-8 space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
              <DollarSign className="mr-3 h-8 w-8 text-green-600" />
              FX Rates Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">Manage currency exchange rates for financial reporting.</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Rate
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Rate to Base (XAF)</TableHead>
                <TableHead>As Of</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="4" className="text-center h-24">
                      <div className="flex justify-center items-center">
                          <Loader2 className="animate-spin mr-2" /> Loading rates...
                      </div>
                  </TableCell>
                </TableRow>
              ) : rates.length > 0 ? (
                rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">{rate.currency}</TableCell>
                    <TableCell>{rate.rate_to_base}</TableCell>
                    <TableCell>{format(new Date(rate.as_of), 'PPP')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(rate)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteRate(rate.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" className="text-center h-24">No rates found. Add one to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {currentRate && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentRate.id ? 'Edit' : 'Add'} FX Rate</DialogTitle>
                <DialogDescription>
                  Set the exchange rate for a currency against the base currency (XAF).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    placeholder="e.g., USD, EUR, NGN"
                    value={currentRate.currency}
                    onChange={(e) => setCurrentRate({ ...currentRate, currency: e.target.value.toUpperCase() })}
                    disabled={!!currentRate.id}
                  />
                </div>
                <div>
                  <Label htmlFor="rate">Rate to Base (XAF)</Label>
                  <Input
                    id="rate"
                    type="number"
                    placeholder="e.g., 610.5"
                    value={currentRate.rate_to_base}
                    onChange={(e) => setCurrentRate({ ...currentRate, rate_to_base: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSaveRate} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Rate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </>
  );
};

export default FXRatesPage;