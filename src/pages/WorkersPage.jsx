import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import Papa from 'papaparse';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Badge } from '@/components/ui/badge';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Upload, Loader2, Users, RefreshCw, CheckCircle, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
    import { motion } from 'framer-motion';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
      DialogFooter,
      DialogTrigger,
    } from '@/components/ui/dialog';
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';
    import EditWorkerDialog from '@/components/workers/EditWorkerDialog';
    import AddWorkerDialog from '@/components/workers/AddWorkerDialog';
    import DeleteWorkerDialog from '@/components/workers/DeleteWorkerDialog';

    const ImportWorkersDialog = ({ onUpdate }) => {
      const { t } = useTranslation('custom');
      const { toast } = useToast();
      const [open, setOpen] = useState(false);
      const [file, setFile] = useState(null);
      const [loading, setLoading] = useState(false);

      const handleImport = () => {
        if (!file) return;
        setLoading(true);

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_'),
          complete: async (results) => {
            const { data, meta } = results;
            const requiredFields = ['worker_code', 'first_name', 'surname'];
            const headers = meta.fields;
            
            const missingHeaders = requiredFields.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
                toast({ title: t('Import Error', { ns: 'custom' }), description: `CSV is missing required columns: ${missingHeaders.join(', ')}`, variant: 'destructive' });
                setLoading(false);
                return;
            }

            const processedData = data.map(row => ({
                worker_code: row.worker_code,
                first_name: row.first_name,
                surname: row.surname,
                trade: row.trade,
                currency: row.currency,
                daily_rate: row.daily_rate ? parseFloat(row.daily_rate) : null,
                active: row.active ? ['true', '1', 'yes'].includes(row.active.toLowerCase()) : true,
                project_code: row.project_code,
                days_worked: row.days_worked ? parseInt(row.days_worked, 10) : null
            }));

            const { error } = await supabase.from('workers_staging').insert(processedData);
            
            setLoading(false);
            if (error) {
                toast({ title: t('Import Error', { ns: 'custom' }), description: error.message, variant: 'destructive' });
            } else {
              toast({ title: t('Import Success', { ns: 'custom' }), description: `${data.length} worker records staged for processing.` });
              onUpdate();
              setOpen(false);
              setFile(null);
            }
          }
        });
      };

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />{t('Import Data', { ns: 'custom' })}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Import Worker Data', { ns: 'custom' })}</DialogTitle>
              <DialogDescription>{t('Import a CSV file with worker details. Ensure it has columns: worker_code, first_name, surname.', { ns: 'custom' })}</DialogDescription>
            </DialogHeader>
            <div className="py-4"><Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} /></div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t('Cancel', { ns: 'custom' })}</Button>
              <Button onClick={handleImport} disabled={!file || loading}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> {t('Importing', { ns: 'custom' })}</> : t('Import Data', { ns: 'custom' })}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };


    const WorkersPage = () => {
      const { t, i18n } = useTranslation(['translation', 'custom']);
      const { toast } = useToast();
      const [workers, setWorkers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [processing, setProcessing] = useState(false);
      const [stagedCount, setStagedCount] = useState(0);
      const [editingWorker, setEditingWorker] = useState(null);
      const [deletingWorker, setDeletingWorker] = useState(null);
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

      const fetchWorkers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('workers')
          .select(`
            *,
            worker_projects (
              project_code
            )
          `)
          .order('surname', { ascending: true });

        if (error) {
          toast({ title: t('error'), description: error.message, variant: 'destructive' });
        } else {
          setWorkers(data);
        }
        setLoading(false);
      }, [toast, t]);

      const fetchStagedCount = useCallback(async () => {
        const { count, error } = await supabase
          .from('workers_staging')
          .select('*', { count: 'exact', head: true })
          .is('processed_at', null);
          
        if (error) {
            console.error("Error fetching staged count:", error.message);
        } else {
            setStagedCount(count || 0);
        }
      }, []);

      useEffect(() => {
        fetchWorkers();
        fetchStagedCount();
      }, [fetchWorkers, fetchStagedCount]);

      const handleProcessStagedData = async () => {
        setProcessing(true);
        const { data, error } = await supabase.rpc('fn_commit_workers_from_staging');

        if (error) {
          toast({ title: t('error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: "Processing Complete", description: `${data} worker records have been processed.` });
          fetchWorkers();
          fetchStagedCount();
        }
        setProcessing(false);
      };
      
      const handleRefresh = () => {
          fetchWorkers();
          fetchStagedCount();
      }

      const handleEditClick = (worker) => {
        setEditingWorker(worker);
        setIsEditDialogOpen(true);
      };

      const handleDeleteClick = (worker) => {
        setDeletingWorker(worker);
        setIsDeleteDialogOpen(true);
      };

      const getWorkerStatus = (worker) => {
        if (worker.project_completed) {
          return { text: t('Project Completed', { ns: 'custom' }), variant: 'default' };
        }
        if (worker.task_completed) {
          return { text: t('Task Completed', { ns: 'custom' }), variant: 'warning' };
        }
        if (worker.active) {
          return { text: t('Active', { ns: 'custom' }), variant: 'success' };
        }
        return { text: t('Inactive', { ns: 'custom' }), variant: 'destructive' };
      };

      const calculateTotalSalary = (worker) => {
        if (worker.daily_rate && worker.days_worked) {
          const total = worker.daily_rate * worker.days_worked;
          return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: worker.currency || 'USD' }).format(total);
        }
        return 'N/A';
      };

      return (
        <>
          <Helmet>
            <html lang={i18n.language} />
            <title>{t('Worker Directory', { ns: 'custom' })} - DomusBuilder Hub</title>  
            <meta name="description" content={t('Worker Directory', { ns: 'custom' })} />
          </Helmet>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('Worker Directory', { ns: 'custom' })}</h1>
                <p className="text-muted-foreground mt-1">{t('Manage your workforce, track their status, and handle payroll.', { ns: 'custom' })}</p>
              </div>
              <div className="flex gap-2">
                <AddWorkerDialog onUpdate={handleRefresh} />
                <ImportWorkersDialog onUpdate={handleRefresh} />
                <Button onClick={handleRefresh} variant="ghost" size="icon" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
              </div>
            </div>

            {stagedCount > 0 && (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-yellow-800 flex items-center gap-2"><Clock /> {t('Pending Workers', { ns: 'custom' })}</CardTitle>
                            <CardDescription className="text-yellow-700">You have {stagedCount} worker(s) staged from a CSV import.</CardDescription>
                        </div>
                        <Button onClick={handleProcessStagedData} disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {t('Process Staged Data', { ns: 'custom' })}
                        </Button>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>{t('Worker Directory', { ns: 'custom' })}</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>{t('Worker Code', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Full Name', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Trade', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Daily Rate', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Days Worked', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Total Salary', { ns: 'custom' })}</TableHead>
                                <TableHead>{t('Status', { ns: 'custom' })}</TableHead>
                                <TableHead className="text-right">{t('Actions', { ns: 'custom' })}</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-32"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-20"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-16"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-24"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-16"></div></TableCell>
                                    <TableCell><div className="h-4 bg-gray-200 rounded w-16"></div></TableCell>
                                </TableRow>
                                ))
                            ) : workers.length > 0 ? (
                                workers.map(worker => {
                                  const status = getWorkerStatus(worker);
                                  return (
                                    <TableRow key={worker.id}>
                                        <TableCell className="font-mono text-sm">{worker.worker_code}</TableCell>
                                        <TableCell>{worker.first_name} {worker.surname}</TableCell>
                                        <TableCell>{worker.trade}</TableCell>
                                        <TableCell>{worker.daily_rate ? new Intl.NumberFormat(i18n.language, { style: 'currency', currency: worker.currency || 'USD' }).format(worker.daily_rate) : 'N/A'}</TableCell>
                                        <TableCell>{worker.days_worked || 0}</TableCell>
                                        <TableCell>{calculateTotalSalary(worker)}</TableCell>
                                        <TableCell>
                                        <Badge variant={status.variant}>
                                            {status.text}
                                        </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => handleEditClick(worker)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>{t('Edit', { ns: 'custom' })}</span>
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => handleDeleteClick(worker)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>{t('Delete', { ns: 'custom' })}</span>
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                  )
                                })
                            ) : (
                                <TableRow>
                                <TableCell colSpan="8" className="text-center py-10 text-gray-500">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    {t('common.no_data', { ns: 'custom' })}
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            
            <EditWorkerDialog
              worker={editingWorker}
              open={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              onUpdate={handleRefresh}
            />

            <DeleteWorkerDialog
              worker={deletingWorker}
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onUpdate={handleRefresh}
            />
          </motion.div>
        </>
      );
    };

    export default WorkersPage;