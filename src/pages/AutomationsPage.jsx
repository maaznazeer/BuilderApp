import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AutomationsPage = () => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    
    const [automations, setAutomations] = useState({
        dueDateReminders: true,
        approvalOverdue: true,
    });

    const handleToggle = (id) => {
        setAutomations(prev => ({ ...prev, [id]: !prev[id] }));
        toast({
            title: "🚧 This feature is a work in progress!",
            description: "Saving settings isn't implemented yet, but you can request it! 🚀",
        });
    };

    const handleRunManually = async () => {
        setIsLoading(true);
        toast({
            title: "Manual Trigger Sent",
            description: "The automation check will run in the background shortly.",
        });

        try {
            const { data: workflowData, error: workflowError } = await supabase.functions.invoke('workflow-automations');
            if (workflowError) throw workflowError;

            const { data: taskData, error: taskError } = await supabase.functions.invoke('task-automations');
            if (taskError) throw taskError;

            toast({
                title: "Automations Executed!",
                description: "Background checks for workflows and tasks have been completed.",
                variant: "success",
            });
        } catch (error) {
             toast({
                title: "Error Running Automations",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <html lang={i18n.language} />
                <title>Workflow Automations - DomusBuilder Hub</title>
                <meta name="description" content="Manage automated notifications for your construction workflows." />
            </Helmet>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Workflow Automations</h1>
                        <p className="text-gray-500 mt-1">Configure automated reminders and notifications to keep your projects on track.</p>
                    </div>
                    <Button onClick={handleRunManually} disabled={isLoading}>
                        <Clock className="mr-2 h-4 w-4" /> 
                        {isLoading ? 'Running...' : 'Run Automations Manually'}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="mr-2 h-5 w-5 text-blue-500" />
                                Due Date Reminders
                            </CardTitle>
                            <CardDescription>
                                Automatically notify assignees when a task's due date is approaching. This applies to workflow steps where "Auto Reminder" is enabled.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="dueDateReminders" 
                                    checked={automations.dueDateReminders}
                                    onCheckedChange={() => handleToggle('dueDateReminders')}
                                />
                                <Label htmlFor="dueDateReminders">
                                    {automations.dueDateReminders ? 'Enabled' : 'Disabled'}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                                Overdue Approval Alerts
                            </CardTitle>
                            <CardDescription>
                                Send a notification to the required approver if a step has been pending approval for more than 48 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-2">
                                <Switch 
                                    id="approvalOverdue" 
                                    checked={automations.approvalOverdue}
                                    onCheckedChange={() => handleToggle('approvalOverdue')}
                                />
                                <Label htmlFor="approvalOverdue">
                                    {automations.approvalOverdue ? 'Enabled' : 'Disabled'}
                                </Label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="text-gray-600 space-y-2">
                        <p>
                            Our system automatically checks for pending tasks and approvals once every 24 hours.
                        </p>
                        <p>
                            - <span className="font-semibold">Due Date Reminders</span> are sent 3 days before the scheduled due date for any workflow step marked with "Auto Reminder".
                        </p>
                        <p>
                            - <span className="font-semibold">Approval Alerts</span> are sent for any step that has been in the "Pending Approval" status for more than 48 hours.
                        </p>
                        <p>
                            You can disable these automations at any time using the toggles above. Notifications will be sent via email (feature coming soon).
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </>
    );
};

export default AutomationsPage;