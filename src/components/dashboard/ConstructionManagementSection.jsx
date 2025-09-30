import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, GitBranch, Files, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useConstructionProcesses, useWorkflowTemplates, useAutomations } from '@/hooks/useConstructionManagement.js';

const ManagementCard = ({ title, icon: Icon, data, isLoading, renderItem, buttonText, buttonLink }) => {
    const navigate = useNavigate();

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow space-y-3 pt-2">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                ) : (
                    data?.slice(0, 3).map(renderItem)
                )}
                 {data?.length === 0 && <p className="text-sm text-muted-foreground text-center pt-4">No items to display.</p>}
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant="secondary" onClick={() => navigate(buttonLink)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {buttonText}
                </Button>
            </CardFooter>
        </Card>
    );
};

const ConstructionManagementSection = () => {
    const { data: processes, isLoading: processesLoading } = useConstructionProcesses();
    const { data: templates, isLoading: templatesLoading } = useWorkflowTemplates();
    const { data: automations, isLoading: automationsLoading } = useAutomations();

    const renderProcess = (item) => (
        <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
            <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Owner: {item.owner}</p>
            </div>
            <p className="text-sm font-medium">{item.stage_count} Stages</p>
        </div>
    );

    const renderTemplate = (item) => (
        <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
            <p className="font-semibold text-sm">{item.name}</p>
            <p className="text-sm font-medium">{item.use_count} uses</p>
        </div>
    );

    const renderAutomation = (item) => (
        <div key={item.id} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg">
             <div>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Trigger: {item.trigger}</p>
            </div>
            <p className="text-sm text-muted-foreground">{item.last_run ? formatDistanceToNow(new Date(item.last_run), { addSuffix: true }) : 'Never'}</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Construction Management</h2>
            <motion.div
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ManagementCard
                        title="Construction Process"
                        icon={GitBranch}
                        data={processes}
                        isLoading={processesLoading}
                        renderItem={renderProcess}
                        buttonText="New Process"
                        buttonLink="/dashboard/construction-process"
                    />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ManagementCard
                        title="Workflow Templates"
                        icon={Files}
                        data={templates}
                        isLoading={templatesLoading}
                        renderItem={renderTemplate}
                        buttonText="New Template"
                        buttonLink="/dashboard/workflow-templates"
                    />
                </motion.div>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                    <ManagementCard
                        title="Automations"
                        icon={Bot}
                        data={automations}
                        isLoading={automationsLoading}
                        renderItem={renderAutomation}
                        buttonText="New Automation"
                        buttonLink="/dashboard/automations"
                    />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ConstructionManagementSection;