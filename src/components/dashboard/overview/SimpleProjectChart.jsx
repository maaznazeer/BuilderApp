import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProject } from '@/contexts/ProjectContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const SimpleProjectChart = () => {
    const { projects, loading: projectsLoading } = useProject();
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (projects && projects.length > 0) {
            // Create simple mock data for testing
            const mockData = projects.map((project, index) => ({
                name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
                budget: project.budget_total || 100000,
                spent: Math.random() * (project.budget_total || 100000),
                remaining: (project.budget_total || 100000) - Math.random() * (project.budget_total || 100000)
            }));
            setChartData(mockData);
        }
    }, [projects]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    if (projectsLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Project Costs (Loading...)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-muted-foreground">Loading chart data...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Project Costs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-64 flex items-center justify-center">
                        <div className="text-muted-foreground">No project data available</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Project Budget vs Spent
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="name" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={12}
                                />
                                <YAxis 
                                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                    formatter={(value, name) => [
                                        formatCurrency(value), 
                                        name === 'budget' ? 'Budget' : name === 'spent' ? 'Spent' : 'Remaining'
                                    ]}
                                    labelFormatter={(label) => `Project: ${label}`}
                                />
                                <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card> */}
        </motion.div>
    );
};

export default SimpleProjectChart;
