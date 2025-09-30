import React, { useState, useEffect, useCallback } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { useTranslation } from 'react-i18next';
    import { supabase } from '@/lib/customSupabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import Papa from 'papaparse';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Badge } from '@/components/ui/badge';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Upload, Loader2, RefreshCw, CheckCircle, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';
    import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
    } from '@/components/ui/card';

    const WbsImportPage = () => {
      const { t, i18n } = useTranslation(['custom', 'translation']);
      const { toast } = useToast();
      const [file, setFile] = useState(null);
      const [loading, setLoading] = useState(false);
      const [processing, setProcessing] = useState(false);
      const [stagedTasks, setStagedTasks] = useState([]);
      const [stagedCount, setStagedCount] = useState(0);

      const fetchStagedTasks = useCallback(async () => {
        setLoading(true);
        const { data, count, error } = await supabase
          .from('wbs_tasks_staging')
          .select('*', { count: 'exact' })
          .is('processed_at', null)
          .order('id', { ascending: true });
          
        if (error) {
            toast({ title: t('translation:error'), description: error.message, variant: 'destructive' });
        } else {
            setStagedTasks(data || []);
            setStagedCount(count || 0);
        }
        setLoading(false);
      }, [toast, t]);

      useEffect(() => {
        fetchStagedTasks();
      }, [fetchStagedTasks]);

      const handleImport = () => {
        if (!file) return;
        setLoading(true);

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_'),
          complete: async (results) => {
            const { data, meta } = results;
            const requiredFields = ['id', 'project_code', 'name', 'type', 'status'];
            const headers = meta.fields;
            
            const missingHeaders = requiredFields.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
                toast({ title: t('workers.import_error'), description: `CSV is missing required columns: ${missingHeaders.join(', ')}`, variant: 'destructive' });
                setLoading(false);
                return;
            }

            const processedData = data.map(row => ({
                id: parseInt(row.id, 10),
                project_code: row.project_code,
                wbs: row.wbs,
                level: row.level ? parseInt(row.level, 10) : null,
                name: row.name,
                type: row.type,
                phase: row.phase,
                status: row.status,
                percent_complete: row.percent_complete ? parseInt(row.percent_complete, 10) : null,
                duration_days: row.duration_days ? parseInt(row.duration_days, 10) : null,
                predecessors: row.predecessors,
                start_offset_days: row.start_offset_days ? parseInt(row.start_offset_days, 10) : null,
                end_offset_days: row.end_offset_days ? parseInt(row.end_offset_days, 10) : null,
                responsible: row.responsible,
                deliverable: row.deliverable,
                notes: row.notes,
                priority: row.priority,
            }));

            const { error } = await supabase.from('wbs_tasks_staging').upsert(processedData, { onConflict: 'id,project_code' });
            
            setLoading(false);
            if (error) {
              toast({ title: t('workers.import_error'), description: error.message, variant: 'destructive' });
            } else {
              toast({ title: t('workers.import_success'), description: `${data.length} WBS tasks staged for processing.` });
              fetchStagedTasks();
              setFile(null);
            }
          }
        });
      };
      
      const handleProcessStagedData = async () => {
        setProcessing(true);
        const { data, error } = await supabase.rpc('fn_commit_wbs_tasks_from_staging');

        if (error) {
          toast({ title: t('translation:error'), description: error.message, variant: 'destructive' });
        } else {
          toast({ title: "Processing Complete", description: `${data} WBS tasks have been processed.` });
          fetchStagedTasks();
        }
        setProcessing(false);
      };
      
      const handleRefresh = () => {
          fetchStagedTasks();
      }

      return (
        <>
          <Helmet>
            <html lang={i18n.language} />
            <title>{t('wbs.import_title')} - DomusBuilder Hub</title>
            <meta name="description" content={t('wbs.import_description')} />
          </Helmet>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('wbs.import_title')}</h1>
                <p className="text-muted-foreground mt-1">{t('wbs.import_description')}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="max-w-xs" />
                <Button onClick={handleImport} disabled={!file || loading}><Upload className="mr-2 h-4 w-4" />{loading ? t('workers.importing') : t('wbs.stage_file')}</Button>
                <Button onClick={handleRefresh} variant="ghost" size="icon" disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
              </div>
            </div>

            {stagedCount > 0 && (
                <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-yellow-800 dark:text-yellow-300 flex items-center gap-2"><Clock /> {t('wbs.pending_tasks_title')}</CardTitle>
                            <CardDescription className="text-yellow-700 dark:text-yellow-400">{t('wbs.pending_tasks_desc', { count: stagedCount })}</CardDescription>
                        </div>
                        <Button onClick={handleProcessStagedData} disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            {t('wbs.process_staged_button')}
                        </Button>
                    </CardHeader>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('wbs.staged_tasks_title')}</CardTitle>
                    <CardDescription>{t('wbs.staged_tasks_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>{t('wbs.table_project')}</TableHead>
                                    <TableHead>WBS</TableHead>
                                    <TableHead>{t('wbs.table_name')}</TableHead>
                                    <TableHead>{t('wbs.table_type')}</TableHead>
                                    <TableHead>{t('wbs.table_status')}</TableHead>
                                    <TableHead>{t('wbs.table_priority')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan="7"><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></TableCell>
                                </TableRow>
                                ))
                            ) : stagedTasks.length > 0 ? (
                                stagedTasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-mono text-sm">{task.id}</TableCell>
                                        <TableCell>{task.project_code}</TableCell>
                                        <TableCell>{task.wbs}</TableCell>
                                        <TableCell>{task.name}</TableCell>
                                        <TableCell><Badge variant="outline">{task.type}</Badge></TableCell>
                                        <TableCell><Badge>{task.status}</Badge></TableCell>
                                        <TableCell>{task.priority}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan="7" className="text-center py-10 text-muted-foreground">
                                    {t('wbs.no_staged_tasks')}
                                </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </motion.div>
        </>
      );
    };

    export default WbsImportPage;