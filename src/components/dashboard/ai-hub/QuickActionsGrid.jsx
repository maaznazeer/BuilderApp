import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload, MessageSquare, CheckCircle, BarChart, FileText, Settings, LifeBuoy, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const QuickActionItem = ({ icon: Icon, title, description, onClick }) => {
    return (
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="h-full flex flex-col transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Icon className="h-5 w-5 text-primary" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground mb-4">{description}</p>
                    <Button variant="secondary" size="sm" onClick={onClick}>
                        Launch
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const QuickActionsGrid = () => {
    const { toast } = useToast();
    const showToast = () => {
        toast({
            title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
        });
    };

    const actions = [
        { icon: PlusCircle, title: 'New Vision Task', description: 'Analyze a new set of site photos or videos.', onClick: showToast },
        { icon: Upload, title: 'Upload QA Data', description: 'Submit material photos for quality assurance checks.', onClick: showToast },
        { icon: MessageSquare, title: 'Generate Report', description: 'Create a summary report for stakeholders.', onClick: showToast },
        { icon: CheckCircle, title: 'Verify Compliance', description: 'Check plans against local building codes.', onClick: showToast },
        { icon: BarChart, title: 'Update Cost Forecast', description: 'Re-evaluate project costs based on new data.', onClick: showToast },
        { icon: FileText, title: 'Draft Communication', description: 'Generate a project update for clients or team.', onClick: showToast },
        { icon: Settings, title: 'Configure AI Models', description: 'Adjust sensitivity and parameters for AI analysis.', onClick: showToast },
        { icon: LifeBuoy, title: 'Get AI Assistance', description: 'Ask the AI a question about your project.', onClick: showToast },
        { icon: AlertCircle, title: 'Review Smart Alerts', description: 'Check and manage AI-generated alerts.', onClick: showToast },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {actions.map((action, index) => (
                    <QuickActionItem key={index} {...action} />
                ))}
            </div>
        </div>
    );
};

export default QuickActionsGrid;