import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

const DeleteWorkerDialog = ({ worker, open, onOpenChange, onUpdate }) => {
  const { t } = useTranslation('custom');
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!worker) return;

    setLoading(true);
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', worker.id);

    setLoading(false);
    if (error) {
      toast({ title: t('workers.delete_error'), description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('workers.delete_success'), description: `Worker ${worker.first_name} ${worker.surname} deleted.` });
      onUpdate();
      onOpenChange(false);
    }
  };

  if (!worker) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('workers.delete_worker_title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('workers.delete_worker_desc', { name: `${worker.first_name} ${worker.surname}` })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t('materials.cancel')}</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('workers.deleting')}</> : t('workers.delete_worker')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWorkerDialog;