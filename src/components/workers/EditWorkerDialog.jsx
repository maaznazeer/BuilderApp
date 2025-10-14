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
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { currencies } from '@/lib/currencies';
import { trades } from '@/lib/trades';

const EditWorkerDialog = ({ worker, open, onOpenChange, onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    trade: '',
    daily_rate: '',
    currency: 'USD',
    days_worked: '',
    active: true,
    task_completed: false,
    project_completed: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (worker) {
      setFormData({
        first_name: worker.first_name || '',
        surname: worker.surname || '',
        trade: worker.trade || '',
        daily_rate: worker.daily_rate || '',
        currency: worker.currency || 'USD',
        days_worked: worker.days_worked || '',
        active: worker.active,
        task_completed: worker.task_completed || false,
        project_completed: worker.project_completed || false,
      });
    }
  }, [worker]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => {
      const newState = { ...prev, [name]: checked };
      if (checked) {
        if (name === 'project_completed') {
          newState.task_completed = false;
          newState.active = false;
        } else if (name === 'task_completed') {
          newState.project_completed = false;
          newState.active = false;
        } else if (name === 'active') {
          newState.project_completed = false;
          newState.task_completed = false;
        }
      }
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!worker) return;

    setLoading(true);
    const { error } = await supabase
      .from('workers')
      .update({
        ...formData,
        daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
        days_worked: formData.days_worked ? parseInt(formData.days_worked, 10) : null,
      })
      .eq('id', worker.id);

    setLoading(false);
    if (error) {
      toast({ title: t('workers.update_error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('workers.update_success'), description: `Worker ${formData.first_name} ${formData.surname} updated.` });
      onUpdate();
      onOpenChange(false);
    }
  };

  if (!worker) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Edit Worker')}</DialogTitle>
          <DialogDescription>{t('workers.edit_worker_desc', { name: `${worker.first_name} ${worker.surname}` })}</DialogDescription>
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
            <Select onValueChange={(value) => handleSelectChange('trade', value)} value={formData.trade}>
              <SelectTrigger>
                <SelectValue placeholder="Select trade" />
              </SelectTrigger>
              <SelectContent>
                {trades.map(trade => (
                  <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_rate">{t('Daily Rate')}</Label>
              <Input id="daily_rate" name="daily_rate" type="number" value={formData.daily_rate} onChange={handleChange} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="days_worked">{t('Days Worked')}</Label>
              <Input id="days_worked" name="days_worked" type="number" value={formData.days_worked} onChange={handleChange} />
            </div>
          </div>
           <div className="space-y-2">
              <Label htmlFor="currency">{t('Currency')}</Label>
              <Select onValueChange={(value) => handleSelectChange('currency', value)} value={formData.currency}>
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
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleSwitchChange('active', checked)} />
              <Label htmlFor="active">{t('Active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="task_completed" checked={formData.task_completed} onCheckedChange={(checked) => handleSwitchChange('task_completed', checked)} />
              <Label htmlFor="task_completed">{t('Task Completed')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="project_completed" checked={formData.project_completed} onCheckedChange={(checked) => handleSwitchChange('project_completed', checked)} />
              <Label htmlFor="project_completed">{t('Project Completed')}</Label>
            </div>
          </div>
          <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('Saving')}</> : t('Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWorkerDialog;