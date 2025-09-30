import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Loader2, Edit, Trash2, ShieldCheck, ShieldAlert, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const AddScenarioDialog = ({ isOpen, onOpenChange, onSave, scenario, projectId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ scenario: '', estimated_cost: '', risk_rating: 'Low' });

  useEffect(() => {
    if (scenario) {
      setFormData({
        scenario: scenario.scenario || '',
        estimated_cost: scenario.estimated_cost || '',
        risk_rating: scenario.risk_rating || 'Low',
      });
    } else {
      setFormData({ scenario: '', estimated_cost: '', risk_rating: 'Low' });
    }
  }, [scenario, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scenario || !formData.estimated_cost) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Scenario and Estimated Cost are required.' });
      return;
    }
    setLoading(true);

    const payload = {
      ...formData,
      project_id: projectId,
      estimated_cost: parseFloat(formData.estimated_cost),
    };

    const { error } = scenario?.id
      ? await supabase.from('contingencies').update(payload).eq('id', scenario.id)
      : await supabase.from('contingencies').insert(payload);

    setLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success!', description: `Scenario ${scenario ? 'updated' : 'created'}.` });
      onSave();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{scenario ? 'Edit Risk Scenario' : 'Add New Risk Scenario'}</DialogTitle>
          <DialogDescription>Define a potential risk and its estimated financial impact.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="scenario">Scenario</Label>
            <Input id="scenario" value={formData.scenario} onChange={(e) => setFormData({ ...formData, scenario: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated_cost">Estimated Cost</Label>
              <Input id="estimated_cost" type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="risk_rating">Risk Rating</Label>
              <Select value={formData.risk_rating} onValueChange={(value) => setFormData({ ...formData, risk_rating: value })}>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {scenario ? 'Save Changes' : 'Create Scenario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


const ContingencyTab = ({ project }) => {
  const { toast } = useToast();
  const [contingencies, setContingencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScenarioDialogOpen, setIsScenarioDialogOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState(null);
  const [materialCost, setMaterialCost] = useState(0);

  const [inflationPercent, setInflationPercent] = useState(10);
  const [delayWeeks, setDelayWeeks] = useState(2);
  
  const WEEKLY_LABOR_COST_ESTIMATE = 5000; // A placeholder for weekly operational/labor costs

  const fetchData = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);

    const [contingenciesRes, materialsRes, expensesRes] = await Promise.all([
        supabase.from('contingencies').select('*').eq('project_id', project.id).order('created_at'),
        supabase.from('materials').select('unit_cost, quantity').eq('project_id', project.id),
        supabase.from('expenses').select('amount').eq('project_id', project.id).eq('category', 'Labor')
    ]);

    if (contingenciesRes.error) toast({ variant: 'destructive', title: 'Error fetching contingencies', description: contingenciesRes.error.message });
    else setContingencies(contingenciesRes.data || []);

    if (materialsRes.error) toast({ variant: 'destructive', title: 'Error fetching materials', description: materialsRes.error.message });
    else {
        const totalMaterialCost = materialsRes.data.reduce((acc, item) => acc + (item.unit_cost * item.quantity), 0);
        setMaterialCost(totalMaterialCost);
    }
    
    setLoading(false);
  }, [project?.id, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteScenario = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scenario?")) return;
    const { error } = await supabase.from('contingencies').delete().eq('id', id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Success!', description: 'Scenario deleted.' });
      fetchData();
    }
  };

  const handleAddScenario = () => { setScenarioToEdit(null); setIsScenarioDialogOpen(true); };
  const handleEditScenario = (c) => { setScenarioToEdit(c); setIsScenarioDialogOpen(true); };

  const riskRatingProps = {
    Low: { variant: 'success', icon: ShieldCheck, label: 'Low' },
    Medium: { variant: 'accent', icon: ShieldAlert, label: 'Medium' },
    High: { variant: 'destructive', icon: Shield, label: 'High' },
  };
  
  const { inflationImpact, delayImpact, totalImpact, recommendedBuffer } = useMemo(() => {
    const inflationImpact = materialCost * (inflationPercent / 100);
    const delayImpact = delayWeeks * WEEKLY_LABOR_COST_ESTIMATE;
    const totalImpact = inflationImpact + delayImpact;
    const recommendedBuffer = totalImpact * 1.25; // Recommended buffer is 125% of the calculated impact
    return { inflationImpact, delayImpact, totalImpact, recommendedBuffer };
  }, [materialCost, inflationPercent, delayWeeks, WEEKLY_LABOR_COST_ESTIMATE]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: project.currency || 'USD' }).format(value);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Risk Scenarios</CardTitle>
              <CardDescription>A list of potential risks and their estimated costs.</CardDescription>
            </div>
            <Button onClick={handleAddScenario}><PlusCircle className="mr-2 h-4 w-4" /> Add Scenario</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scenario</TableHead>
                    <TableHead>Estimated Cost</TableHead>
                    <TableHead>Risk Rating</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contingencies.length > 0 ? contingencies.map(c => {
                    const { variant, icon: Icon, label } = riskRatingProps[c.risk_rating] || { variant: 'default', icon: Shield, label: c.risk_rating };
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.scenario}</TableCell>
                        <TableCell>{formatCurrency(c.estimated_cost)}</TableCell>
                        <TableCell>
                          <Badge variant={variant} className="gap-1">
                            <Icon className="h-3.5 w-3.5" />
                            <span>{label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditScenario(c)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteScenario(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    );
                  }) : (
                    <TableRow><TableCell colSpan={4} className="text-center h-24">No risk scenarios defined yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>What-If Analysis</CardTitle>
            <CardDescription>Estimate potential cost overruns from common risks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="inflation-slider" className="flex justify-between">
                <span>Material Inflation</span>
                <span className="font-bold">{inflationPercent}%</span>
              </Label>
              <Slider id="inflation-slider" value={[inflationPercent]} onValueChange={([val]) => setInflationPercent(val)} max={30} step={1} className="my-2" />
              <div className="flex justify-between items-center text-sm">
                <span>Cost Impact:</span>
                <span className="font-semibold">{formatCurrency(inflationImpact)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="delay-slider" className="flex justify-between">
                <span>Project Delay</span>
                <span className="font-bold">{delayWeeks} weeks</span>
              </Label>
              <Slider id="delay-slider" value={[delayWeeks]} onValueChange={([val]) => setDelayWeeks(val)} max={12} step={1} className="my-2" />
               <div className="flex justify-between items-center text-sm">
                <span>Cost Impact:</span>
                <span className="font-semibold">{formatCurrency(delayImpact)}</span>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <h3>Total Potential Impact:</h3>
                <p>{formatCurrency(totalImpact)}</p>
              </div>
              <div className="bg-accent/10 border-l-4 border-accent p-4 rounded-r-lg">
                <div className="flex items-start">
                    <AlertTriangle className="h-6 w-6 text-accent mr-3 mt-1"/>
                    <div>
                        <p className="font-bold text-accent">Recommended Buffer</p>
                        <p className="text-2xl font-extrabold text-accent">{formatCurrency(recommendedBuffer)}</p>
                        <p className="text-xs text-accent">This is 125% of the total potential impact to provide a safe cushion.</p>
                    </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <AddScenarioDialog 
        isOpen={isScenarioDialogOpen}
        onOpenChange={setIsScenarioDialogOpen}
        onSave={fetchData}
        scenario={scenarioToEdit}
        projectId={project.id}
      />
    </motion.div>
  );
};

export default ContingencyTab;