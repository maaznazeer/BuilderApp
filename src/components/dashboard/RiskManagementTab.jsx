import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle, Shield, PlusCircle, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

const RiskCard = ({ risk, onUpdate, onDelete }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
            <span className="font-semibold">{risk.risk_type}: </span>
            <span className="text-gray-700">{risk.description}</span>
            <span className="text-red-600 font-bold ml-2">(${risk.impact_amount.toLocaleString()})</span>
        </div>
        <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.status === 'Mitigated' ? 'bg-green-100 text-green-800' : risk.status === 'Real' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{risk.status}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onUpdate}><Edit className="h-3 w-3"/></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={onDelete}><Trash2 className="h-3 w-3"/></Button>
        </div>
    </div>
);

const RiskEstimator = ({ project, updateProjects, projects }) => {
    const { toast } = useToast();
    const [openSetup, setOpenSetup] = useState(false);
    const [openAddRisk, setOpenAddRisk] = useState(false);
    const [planData, setPlanData] = useState(project.contingencyPlan || { base_budget: project.budget, contingency_type: '%', threshold_value: 10 });
    const [riskData, setRiskData] = useState({ risk_type: 'Delay', description: '', impact_amount: '', status: 'Simulated' });

    const totalRiskImpact = useMemo(() => 
        (project.costRisks || []).reduce((sum, risk) => sum + Number(risk.impact_amount), 0),
        [project.costRisks]
    );

    const contingencyAmount = useMemo(() => {
        if (!planData) return 0;
        if (planData.contingency_type === '%') {
            return planData.base_budget * (planData.threshold_value / 100);
        }
        return planData.threshold_value;
    }, [planData]);

    const riskAdjustedCost = planData.base_budget + totalRiskImpact;
    const totalBudgetWithContingency = planData.base_budget + contingencyAmount;
    const contingencyRemaining = totalBudgetWithContingency - riskAdjustedCost;
    
    const isOverBudget = riskAdjustedCost > totalBudgetWithContingency;

    const handleSavePlan = (e) => {
        e.preventDefault();
        const updatedProjects = projects.map(p => 
            p.id === project.id ? { ...p, contingencyPlan: { ...planData, plan_id: p.contingencyPlan?.plan_id || Date.now() } } : p
        );
        updateProjects(updatedProjects);
        toast({ title: "Contingency Plan Saved!" });
        setOpenSetup(false);
    };

    const handleAddRisk = (e) => {
        e.preventDefault();
        const newRisk = {
            risk_id: Date.now(),
            plan_id: project.contingencyPlan?.plan_id,
            ...riskData,
            impact_amount: Number(riskData.impact_amount),
            date_logged: new Date().toISOString()
        };
        const updatedProjects = projects.map(p =>
            p.id === project.id ? { ...p, costRisks: [...(p.costRisks || []), newRisk] } : p
        );
        updateProjects(updatedProjects);
        toast({ title: "Cost Risk Added" });
        setRiskData({ risk_type: 'Delay', description: '', impact_amount: '', status: 'Simulated' });
        setOpenAddRisk(false);
    };

    const handleDeleteRisk = (riskId) => {
        const updatedProjects = projects.map(p =>
            p.id === project.id ? { ...p, costRisks: p.costRisks.filter(r => r.risk_id !== riskId) } : p
        );
        updateProjects(updatedProjects);
        toast({ title: "Cost Risk Deleted" });
    }

    if (!project.contingencyPlan) {
        return (
            <div className="text-center p-8">
                <p className="mb-4">No contingency plan set up for this project.</p>
                <Dialog open={openSetup} onOpenChange={setOpenSetup}>
                    <DialogTrigger asChild><Button>Set Up Contingency Plan</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Setup Contingency Plan for {project.name}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSavePlan} className="space-y-4 pt-4">
                            <div><Label>Base Budget</Label><Input type="number" value={planData.base_budget} onChange={e => setPlanData(d => ({...d, base_budget: Number(e.target.value)}))} /></div>
                            <div><Label>Contingency Type</Label><Select value={planData.contingency_type} onValueChange={v => setPlanData(d => ({...d, contingency_type: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="%">Percentage</SelectItem><SelectItem value="Fixed">Fixed Amount</SelectItem></SelectContent></Select></div>
                            <div><Label>Threshold Value</Label><Input type="number" value={planData.threshold_value} onChange={e => setPlanData(d => ({...d, threshold_value: Number(e.target.value)}))}/></div>
                            <DialogFooter><Button type="submit">Save Plan</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className={`p-4 rounded-lg flex items-center justify-between ${isOverBudget ? 'bg-red-50 border-red-200 border-l-4' : 'bg-green-50 border-green-200 border-l-4'}`}>
                <div className="flex items-center space-x-3">
                    {isOverBudget ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <CheckCircle className="h-6 w-6 text-green-500" />}
                    <div>
                        <p className={`font-bold ${isOverBudget ? 'text-red-800' : 'text-green-800'}`}>
                            {isOverBudget ? 'Contingency Breached!' : 'Budget is within contingency'}
                        </p>
                        <p className="text-sm text-gray-600">Risk-adjusted cost is ${riskAdjustedCost.toLocaleString()}.</p>
                    </div>
                </div>
                <Dialog open={openSetup} onOpenChange={setOpenSetup}>
                    <DialogTrigger asChild><Button variant="outline" size="sm">Edit Plan</Button></DialogTrigger>
                     <DialogContent>
                        <DialogHeader><DialogTitle>Edit Contingency Plan for {project.name}</DialogTitle></DialogHeader>
                        <form onSubmit={handleSavePlan} className="space-y-4 pt-4">
                            <div><Label>Base Budget</Label><Input type="number" value={planData.base_budget} onChange={e => setPlanData(d => ({...d, base_budget: Number(e.target.value)}))} /></div>
                            <div><Label>Contingency Type</Label><Select value={planData.contingency_type} onValueChange={v => setPlanData(d => ({...d, contingency_type: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="%">Percentage</SelectItem><SelectItem value="Fixed">Fixed Amount</SelectItem></SelectContent></Select></div>
                            <div><Label>Threshold Value ({planData.contingency_type})</Label><Input type="number" value={planData.threshold_value} onChange={e => setPlanData(d => ({...d, threshold_value: Number(e.target.value)}))}/></div>
                            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-100 p-3 rounded-lg"><p className="text-xs font-semibold text-gray-500">BASE BUDGET</p><p className="font-bold text-lg">${planData.base_budget.toLocaleString()}</p></div>
                <div className="bg-red-100 p-3 rounded-lg"><p className="text-xs font-semibold text-red-500">RISK IMPACT</p><p className="font-bold text-lg text-red-800">+ ${totalRiskImpact.toLocaleString()}</p></div>
                <div className="bg-yellow-100 p-3 rounded-lg"><p className="text-xs font-semibold text-yellow-500">CONTINGENCY</p><p className="font-bold text-lg text-yellow-800">${contingencyAmount.toLocaleString()}</p></div>
                <div className="bg-blue-100 p-3 rounded-lg"><p className="text-xs font-semibold text-blue-500">REMAINING</p><p className="font-bold text-lg text-blue-800">${contingencyRemaining.toLocaleString()}</p></div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Cost Risk Log</h4>
                     <Dialog open={openAddRisk} onOpenChange={setOpenAddRisk}>
                        <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Add Risk</Button></DialogTrigger>
                         <DialogContent>
                            <DialogHeader><DialogTitle>Add New Cost Risk</DialogTitle></DialogHeader>
                            <form onSubmit={handleAddRisk} className="space-y-4 pt-4">
                                <div><Label>Risk Type</Label><Select value={riskData.risk_type} onValueChange={v => setRiskData(d => ({...d, risk_type: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Delay">Delay</SelectItem><SelectItem value="Inflation">Inflation</SelectItem><SelectItem value="Misuse">Material Misuse</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div>
                                <div><Label>Description</Label><Textarea value={riskData.description} onChange={e => setRiskData(d => ({...d, description: e.target.value}))}/></div>
                                <div><Label>Impact Amount</Label><Input type="number" value={riskData.impact_amount} onChange={e => setRiskData(d => ({...d, impact_amount: e.target.value}))}/></div>
                                <div><Label>Status</Label><Select value={riskData.status} onValueChange={v => setRiskData(d => ({...d, status: v}))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Simulated">Simulated</SelectItem><SelectItem value="Real">Real</SelectItem><SelectItem value="Mitigated">Mitigated</SelectItem></SelectContent></Select></div>
                                <DialogFooter><Button type="submit">Log Risk</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                 <div className="space-y-2">
                    {(project.costRisks || []).map(risk => (
                        <RiskCard key={risk.risk_id} risk={risk} onDelete={() => handleDeleteRisk(risk.risk_id)} onUpdate={() => toast({title: "Edit feature coming soon!"})} />
                    ))}
                    {(project.costRisks || []).length === 0 && <p className="text-center text-gray-500 py-4">No cost risks logged yet.</p>}
                </div>
            </div>
        </div>
    )
}

const RiskManagementTab = ({ projects, updateProjects }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Contingency & Cost Risk Estimator</h2>
            <p className="text-gray-600 mt-1">Manage contingency plans and simulate cost risks for your projects.</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4" defaultValue={`item-${projects[0]?.id}`}>
            {projects.map(project => (
                <AccordionItem key={project.id} value={`item-${project.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <AccordionTrigger className="px-6 hover:no-underline">
                        <span className="font-bold text-lg text-gray-800">{project.name}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                        <RiskEstimator project={project} updateProjects={updateProjects} projects={projects} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </motion.div>
  );
};

export default RiskManagementTab;