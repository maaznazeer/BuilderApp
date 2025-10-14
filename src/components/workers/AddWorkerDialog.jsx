import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { currencies } from '@/lib/currencies';
import { v4 as uuidv4 } from 'uuid';

const AddWorkerDialog = ({ onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    trade: '',
    daily_rate: '',
    currency: 'USD',
    active: true,
    days_worked: '',
  });
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('id, name').order('name', { ascending: true });
      if (!error) setProjects(data || []);
    };
    if (open) fetchProjects();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value) => {
    setFormData(prev => ({ ...prev, currency: value }));
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const generateWorkerCode = (firstName, surname) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : 'X';
    const sur = surname ? surname.toUpperCase() : 'WORKER';
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${firstInitial}${sur}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const workerCode = generateWorkerCode(formData.first_name, formData.surname);

    const payload = {
      first_name: formData.first_name,
      surname: formData.surname,
      trade: formData.trade,
      worker_code: workerCode,
      currency: formData.currency,
      active: !!formData.active,
      daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
      days_worked: formData.days_worked === '' ? null : parseInt(formData.days_worked, 10),
    };

    const { error } = await supabase
      .from('workers')
      .insert([
        payload
      ]);

    setLoading(false);
    if (error) {
      toast({ title: t('workers.add_error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('workers.add_success'), description: `Worker ${formData.first_name} ${formData.surname} added.` });
      onUpdate();
      setOpen(false);
      setFormData({
        first_name: '',
        surname: '',
        trade: '',
        daily_rate: '',
        currency: 'USD',
        active: true,
        days_worked: '',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t('Add Worker')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Add Worker')}</DialogTitle>
          <DialogDescription>{t('Add a new worker to the database')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">{t('First Name')}</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">{t('Surname')}</Label>
              <Input id="surname" name="surname" value={formData.surname} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trade">{t('Trade')}</Label>
            <Input id="trade" name="trade" value={formData.trade} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_rate">{t('Daily Rate')}</Label>
              <Input id="daily_rate" name="daily_rate" type="number" value={formData.daily_rate} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t('Currency')}</Label>
              <Select onValueChange={handleCurrencyChange} defaultValue={formData.currency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="days_worked">{t('Days Worked')}</Label>
              <Input id="days_worked" name="days_worked" type="number" value={formData.days_worked} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              {/* <Label htmlFor="project_id">{t('Project')}</Label> */}
              {/* <Select
                value={formData.project_id ? String(formData.project_id) : 'none'}
                onValueChange={(v) => setFormData(prev => ({ ...prev, project_id: v === 'none' ? null : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Select a project')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('None')}</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="active">{t('Active')}</Label>
          </div>
          <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('Cancel')}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('Adding')}</> : t('Add Worker')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerDialog;