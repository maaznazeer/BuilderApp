import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, BellOff, Zap, Bell, ListTodo } from 'lucide-react';
import { usePlan } from '@/hooks/usePlan';
import { Link } from 'react-router-dom';

const ProjectAlertSettings = ({ project, onProjectUpdate }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const { features, plan } = usePlan();
    const [alertSettings, setAlertSettings] = useState(null);
    const [taskAlertsEnabled, setTaskAlertsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!features.emailAlerts) {
            setLoading(false);
            setAlertSettings({ project_code: project.project_code, low_balance_threshold: 0, critical_threshold: 0 });
            setTaskAlertsEnabled(project?.task_alerts_enabled || false);
            return;
        }

        const fetchAlertSettings = async () => {
            if (!user || !project) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('project_alert_settings')
                .select('*')
                .eq('user_id', user.id)
                .eq('project_code', project.project_code)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching alert settings:', error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load alert settings.' });
            } else {
                setAlertSettings(data || { project_code: project.project_code, low_balance_threshold: 0, critical_threshold: 0 });
            }
            setTaskAlertsEnabled(project?.task_alerts_enabled || false);
            setLoading(false);
        };

        fetchAlertSettings();
    }, [user, project, toast, features.emailAlerts]);
    
    const handleSettingChange = (field, value) => {
        setAlertSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveSettings = async () => {
        if (!features.emailAlerts) return;
        
        setSaving(true);
        
        const financialSettingsPromise = supabase
            .from('project_alert_settings')
            .upsert({
                id: alertSettings?.id,
                project_code: project.project_code,
                low_balance_threshold: parseFloat(alertSettings?.low_balance_threshold || 0),
                critical_threshold: parseFloat(alertSettings?.critical_threshold || 0),
                user_id: user.id,
            }, { onConflict: 'project_code' });
            
        const taskAlertsPromise = supabase
            .from('projects')
            .update({ task_alerts_enabled: taskAlertsEnabled })
            .eq('id', project.id);

        const [financialResult, taskResult] = await Promise.all([
            financialSettingsPromise,
            taskAlertsPromise
        ]);
        
        setSaving(false);

        if (financialResult.error || taskResult.error) {
            toast({ variant: 'destructive', title: 'Error saving settings', description: financialResult.error?.message || taskResult.error?.message });
        } else {
            toast({ title: 'Settings saved!', description: `Alert settings for ${project.project_code} updated.`});
            if (onProjectUpdate) {
                onProjectUpdate();
            }
        }
    };
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Project Alert Settings</CardTitle>
                    <CardDescription>Configure financial and task-based email alerts for your project.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="relative">
             {!features.emailAlerts && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8 rounded-xl">
                    <BellOff className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Email Alerts Disabled</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        This feature is not available on the {plan} plan.
                    </p>
                    <Button asChild size="sm" className="mt-4">
                        <Link to="/pricing">
                            <Zap className="mr-2 h-4 w-4" /> Upgrade to Basic
                        </Link>
                    </Button>
                </div>
            )}
            <CardHeader>
                <CardTitle>Project Alert Settings</CardTitle>
                <CardDescription>Configure financial and task-based email alerts for your project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary"/>
                        <h4 className="font-semibold text-lg">Financial Alerts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Set balance thresholds to receive alerts when your project funds are running low.</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor={`low-${project.project_code}`}>Low Balance Threshold ({project.currency})</Label>
                            <Input 
                                id={`low-${project.project_code}`}
                                type="number"
                                placeholder="e.g., 5000"
                                value={alertSettings?.low_balance_threshold || ''}
                                onChange={(e) => handleSettingChange('low_balance_threshold', e.target.value)}
                                disabled={!features.emailAlerts}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`critical-${project.project_code}`}>Critical Balance Threshold ({project.currency})</Label>
                            <Input 
                                id={`critical-${project.project_code}`}
                                type="number"
                                placeholder="e.g., 1000"
                                value={alertSettings?.critical_threshold || ''}
                                onChange={(e) => handleSettingChange('critical_threshold', e.target.value)}
                                disabled={!features.emailAlerts}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                         <ListTodo className="h-5 w-5 text-primary"/>
                        <h4 className="font-semibold text-lg">Task & Milestone Alerts</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Enable daily email digests for overdue tasks and upcoming milestones to stay on track.</p>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch 
                        id="task-alerts"
                        checked={taskAlertsEnabled}
                        onCheckedChange={setTaskAlertsEnabled}
                        disabled={!features.emailAlerts}
                      />
                      <Label htmlFor="task-alerts">Enable daily email digests</Label>
                    </div>
                </div>

            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={saving || !features.emailAlerts}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save All Alert Settings
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProjectAlertSettings;