import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, FileDown, PlusCircle, Upload, Edit, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, isPast } from 'date-fns';
import { useTranslation } from 'react-i18next';

const FinanceTab = ({ projects, updateProjects, handleFeatureClick, setActiveTab }) => {
    const { t } = useTranslation('custom');
    const { toast } = useToast();
    const [openContributionDialog, setOpenContributionDialog] = useState(false);
    const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
    const [contributionData, setContributionData] = useState({ projectId: '', contributor_name: '', contribution_type: 'Microloan', amount: '', date_received: '', note: '' });
    const [expenseData, setExpenseData] = useState({ projectId: '', title: '', amount: '', currency: 'USD', date: '', proof_upload: null, paid_by: '' });

    const financeStats = useMemo(() => {
        let totalContributions = 0;
        let totalExpenses = 0;
        let pendingReimbursements = 0;

        projects.forEach(p => {
            totalContributions += (p.contributionsLedger || []).reduce((sum, c) => sum + c.amount, 0);
            totalExpenses += (p.expenseRecords || []).reduce((sum, e) => sum + e.amount_spent, 0);
            pendingReimbursements += (p.reimbursements || []).filter(r => r.status === 'Pending' || r.status === 'Overdue').reduce((sum, r) => sum + r.amount, 0);
        });

        return {
            totalContributions,
            totalExpenses,
            pendingReimbursements,
            balanceAvailable: totalContributions - totalExpenses,
        };
    }, [projects]);

    const handleAddContribution = (e) => {
        e.preventDefault();
        const projectId = parseInt(contributionData.projectId, 10);
        const newEntry = {
            entry_id: Date.now(),
            ...contributionData,
            amount: parseFloat(contributionData.amount),
        };
        
        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, contributionsLedger: [...(p.contributionsLedger || []), newEntry] };
            }
            return p;
        });
        updateProjects(updatedProjects);
        toast({ title: "Contribution Logged!" });
        setOpenContributionDialog(false);
        setContributionData({ projectId: '', contributor_name: '', contribution_type: 'Microloan', amount: '', date_received: '', note: '' });
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!expenseData.projectId || !expenseData.title || !expenseData.amount || !expenseData.date || !expenseData.paid_by) {
            toast({ title: "Missing Information", description: "Please fill out all required fields.", variant: "destructive" });
            return;
        }

        const projectId = parseInt(expenseData.projectId, 10);
        const newExpense = {
            expense_id: Date.now(),
            category: expenseData.title,
            amount_spent: parseFloat(expenseData.amount),
            currency: expenseData.currency,
            date_spent: expenseData.date,
            proof_upload: expenseData.proof_upload ? expenseData.proof_upload.name : 'N/A',
            paid_by: expenseData.paid_by,
            reimbursed: false,
        };

        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, expenseRecords: [...(p.expenseRecords || []), newExpense] };
            }
            return p;
        });
        updateProjects(updatedProjects);
        toast({ title: "Expense Recorded!", description: `Expense "${newExpense.category}" for ${newExpense.amount_spent} ${newExpense.currency} has been logged.` });
        setOpenExpenseDialog(false);
        setExpenseData({ projectId: '', title: '', amount: '', currency: 'USD', date: '', proof_upload: null, paid_by: '' });
    };
    
    const getStatusBadge = (status, dueDate) => {
        const isOverdue = dueDate && isPast(new Date(dueDate)) && status !== 'Paid';
        const finalStatus = isOverdue ? 'Overdue' : status;

        switch (finalStatus) {
            case 'Paid': return <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3"/>Paid</span>;
            case 'Pending': return <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full"><Clock className="h-3 w-3"/>Pending</span>;
            case 'Overdue': return <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><AlertCircle className="h-3 w-3"/>Overdue</span>;
            default: return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{t('finance.title')}</h2>
                    <p className="text-gray-500">{t('finance.description')}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveTab('budget')}>
                    {t('finance.go_to_budget')}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><TrendingUp className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-gray-500">{t('finance.total_contributions')}</p><p className="text-2xl font-bold text-gray-900">${financeStats.totalContributions.toLocaleString()}</p></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><TrendingDown className="w-6 h-6 text-red-600" /></div><div><p className="text-sm text-gray-500">{t('finance.total_expenses')}</p><p className="text-2xl font-bold text-gray-900">${financeStats.totalExpenses.toLocaleString()}</p></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><Wallet className="w-6 h-6 text-blue-600" /></div><div><p className="text-sm text-gray-500">{t('finance.balance_available')}</p><p className="text-2xl font-bold text-gray-900">${financeStats.balanceAvailable.toLocaleString()}</p></div></div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4"><div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center"><AlertCircle className="w-6 h-6 text-yellow-600" /></div><div><p className="text-sm text-gray-500">{t('finance.pending_reimbursements')}</p><p className="text-2xl font-bold text-gray-900">${financeStats.pendingReimbursements.toLocaleString()}</p></div></div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{t('finance.ledger_title')}</h3>
                    <div className="flex items-center gap-2">
                        <Dialog open={openContributionDialog} onOpenChange={setOpenContributionDialog}>
                            <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4" />{t('finance.log_contribution')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>{t('finance.add_contribution_dialog.title')}</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddContribution} className="space-y-4 pt-4">
                                    <Select onValueChange={v => setContributionData(d => ({...d, projectId: v}))}><SelectTrigger><SelectValue placeholder="Select Project"/></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select>
                                    <Input placeholder={t('finance.add_contribution_dialog.contributor_name')} value={contributionData.contributor_name} onChange={e => setContributionData(d => ({...d, contributor_name: e.target.value}))} />
                                    <Select onValueChange={v => setContributionData(d => ({...d, contribution_type: v}))} defaultValue="Microloan"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Microloan">Microloan</SelectItem><SelectItem value="Gift">Gift</SelectItem><SelectItem value="Reimbursement">Reimbursement</SelectItem></SelectContent></Select>
                                    <Input type="number" placeholder={t('finance.add_contribution_dialog.amount')} value={contributionData.amount} onChange={e => setContributionData(d => ({...d, amount: e.target.value}))} />
                                    <Input type="date" value={contributionData.date_received} onChange={e => setContributionData(d => ({...d, date_received: e.target.value}))} />
                                    <Textarea placeholder={t('finance.add_contribution_dialog.note')} value={contributionData.note} onChange={e => setContributionData(d => ({...d, note: e.target.value}))} />
                                    <DialogFooter><Button type="submit">{t('finance.add_contribution_dialog.add_button')}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={openExpenseDialog} onOpenChange={setOpenExpenseDialog}>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" />{t('finance.log_expense')}</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>{t('finance.add_expense_dialog.title')}</DialogTitle></DialogHeader>
                                <form onSubmit={handleAddExpense} className="space-y-4 pt-4">
                                    <Select onValueChange={v => setExpenseData(d => ({...d, projectId: v}))}><SelectTrigger><SelectValue placeholder="Select Project"/></SelectTrigger><SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select>
                                    <div><Label htmlFor="expenseTitle">{t('finance.add_expense_dialog.expense_title_label')}</Label><Input id="expenseTitle" placeholder="e.g., Cement Purchase" value={expenseData.title} onChange={e => setExpenseData(d => ({...d, title: e.target.value}))} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label htmlFor="amount">{t('finance.add_expense_dialog.amount_label')}</Label><Input id="amount" type="number" placeholder="100.00" value={expenseData.amount} onChange={e => setExpenseData(d => ({...d, amount: e.target.value}))} /></div>
                                        <div><Label htmlFor="currency">{t('finance.add_expense_dialog.currency_label')}</Label><Input id="currency" placeholder="USD" value={expenseData.currency} onChange={e => setExpenseData(d => ({...d, currency: e.target.value}))} /></div>
                                    </div>
                                    <div><Label htmlFor="date">{t('finance.add_expense_dialog.date_label')}</Label><Input id="date" type="date" value={expenseData.date} onChange={e => setExpenseData(d => ({...d, date: e.target.value}))} /></div>
                                    <div><Label htmlFor="payerName">{t('finance.add_expense_dialog.payer_name_label')}</Label><Input id="payerName" placeholder="John Doe" value={expenseData.paid_by} onChange={e => setExpenseData(d => ({...d, paid_by: e.target.value}))} /></div>
                                    <div><Label htmlFor="receipt">{t('finance.add_expense_dialog.proof_upload_label')}</Label><Input id="receipt" type="file" onChange={e => setExpenseData(d => ({...d, proof_upload: e.target.files[0]}))} /></div>
                                    <DialogFooter><Button type="submit">{t('finance.add_expense_dialog.add_button')}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="secondary" onClick={() => handleFeatureClick('Export PDF')}><FileDown className="mr-2 h-4 w-4" />{t('finance.export_pdf')}</Button>
                    </div>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={projects.length > 0 ? `item-${projects[0].id}` : undefined}>
                    {projects.map(project => (
                        <AccordionItem key={project.id} value={`item-${project.id}`} className="bg-gray-50 rounded-xl border">
                            <AccordionTrigger className="px-6 hover:no-underline font-bold text-lg text-gray-800">{project.name}</AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-2">{t('finance.contributions')}</h4>
                                    <div className="space-y-2">{ (project.contributionsLedger || []).map(c => <div key={c.entry_id} className="flex justify-between p-2 border-b"><p>{c.contributor_name} ({c.contribution_type})</p><p className="font-medium text-green-600">+${c.amount.toLocaleString()}</p></div>) }</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">{t('finance.expenses')}</h4>
                                    <div className="space-y-2">{ (project.expenseRecords || []).map(e => <div key={e.expense_id} className="flex justify-between p-2 border-b"><p>{e.category} (Paid by: {e.paid_by})</p><p className="font-medium text-red-600">-${e.amount_spent.toLocaleString()}</p></div>) }</div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">{t('finance.reimbursements')}</h4>
                                    <div className="space-y-2">{ (project.reimbursements || []).map(r => <div key={r.reimburse_id} className="flex justify-between items-center p-2 border-b"><p>To: {r.to_person} (${r.amount.toLocaleString()})</p>{getStatusBadge(r.status, r.due_date)}</div>) }</div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </motion.div>
    );
};

export default FinanceTab;