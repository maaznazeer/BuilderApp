import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const FinancialTrendsChart = () => {
    const { user } = useAuth();
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        fetchFinancialTrends();
    }, [timeRange, user]);

    const fetchFinancialTrends = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange));

            // Fetch financial ledger data with correct column names
            const { data: ledgerData, error: ledgerError } = await supabase
                .from('financial_ledger')
                .select('date, expense_amount, amount_to_be_received')
                .gte('date', startDate.toISOString().split('T')[0])
                .lte('date', endDate.toISOString().split('T')[0])
                .order('date', { ascending: true });

            if (ledgerError) {
                console.error('FinancialTrendsChart - Error fetching ledger data:', ledgerError);
                throw ledgerError;
            }

            console.log('FinancialTrendsChart - Ledger data:', ledgerData);

            // Fetch payroll data
            const { data: payrollData, error: payrollError } = await supabase
                .from('payroll_entries')
                .select('payment_date, total_amount')
                .gte('payment_date', startDate.toISOString().split('T')[0])
                .lte('payment_date', endDate.toISOString().split('T')[0])
                .order('payment_date', { ascending: true });

            if (payrollError) {
                console.error('FinancialTrendsChart - Error fetching payroll data:', payrollError);
                throw payrollError;
            }

            console.log('FinancialTrendsChart - Payroll data:', payrollData);

            // Fetch expenses data
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('created_at, amount')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: true });

            if (expensesError) {
                console.error('FinancialTrendsChart - Error fetching expenses:', expensesError);
                throw expensesError;
            }

            console.log('FinancialTrendsChart - Expenses data:', expensesData);

            // Process and combine data
            const processedData = processFinancialData(ledgerData, payrollData, expensesData);
            console.log('FinancialTrendsChart - Processed data:', processedData);
            setTrendData(processedData);

        } catch (error) {
            console.error('Error fetching financial trends:', error);
        } finally {
            setLoading(false);
        }
    };

    const processFinancialData = (ledgerData, payrollData, expensesData) => {
        console.log('FinancialTrendsChart - Processing data:', {
            ledgerCount: ledgerData?.length || 0,
            payrollCount: payrollData?.length || 0,
            expensesCount: expensesData?.length || 0
        });

        const dataMap = new Map();

        // Process ledger data
        ledgerData?.forEach(entry => {
            const date = entry.date;
            if (!dataMap.has(date)) {
                dataMap.set(date, { date, income: 0, expenses: 0, payroll: 0 });
            }
            const dayData = dataMap.get(date);
            
            // Add income (deposits)
            if (entry.amount_to_be_received > 0) {
                dayData.income += entry.amount_to_be_received || 0;
                console.log(`FinancialTrendsChart - Added income ${entry.amount_to_be_received} for ${date}`);
            }
            
            // Add expenses
            if (entry.expense_amount > 0) {
                dayData.expenses += entry.expense_amount || 0;
                console.log(`FinancialTrendsChart - Added expense ${entry.expense_amount} for ${date}`);
            }
        });

        // Process payroll data
        payrollData?.forEach(entry => {
            const date = entry.payment_date;
            if (!dataMap.has(date)) {
                dataMap.set(date, { date, income: 0, expenses: 0, payroll: 0 });
            }
            const dayData = dataMap.get(date);
            dayData.payroll += entry.total_amount || 0;
            console.log(`FinancialTrendsChart - Added payroll ${entry.total_amount} for ${date}`);
        });

        // Process expenses data
        expensesData?.forEach(entry => {
            const date = entry.created_at.split('T')[0];
            if (!dataMap.has(date)) {
                dataMap.set(date, { date, income: 0, expenses: 0, payroll: 0 });
            }
            const dayData = dataMap.get(date);
            dayData.expenses += entry.amount || 0;
            console.log(`FinancialTrendsChart - Added expense ${entry.amount} for ${date}`);
        });

        // Convert to array and calculate running totals
        const result = Array.from(dataMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('FinancialTrendsChart - Raw data before processing:', result);
        
        let runningIncome = 0;
        let runningExpenses = 0;
        let runningPayroll = 0;

        const finalData = result.map(day => {
            runningIncome += day.income;
            runningExpenses += day.expenses;
            runningPayroll += day.payroll;
            
            const processedDay = {
                ...day,
                runningIncome,
                runningExpenses,
                runningPayroll,
                netFlow: runningIncome - runningExpenses - runningPayroll,
                totalSpent: runningExpenses + runningPayroll
            };
            
            console.log(`FinancialTrendsChart - Processed day ${day.date}:`, processedDay);
            return processedDay;
        });

        console.log('FinancialTrendsChart - Final processed data:', finalData);
        return finalData;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case '7': return 'Last 7 Days';
            case '30': return 'Last 30 Days';
            case '90': return 'Last 90 Days';
            case '365': return 'Last Year';
            default: return 'Last 30 Days';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Financial Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
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
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Financial Trends - {getTimeRangeLabel()}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 Days</SelectItem>
                                    <SelectItem value="30">30 Days</SelectItem>
                                    <SelectItem value="90">90 Days</SelectItem>
                                    <SelectItem value="365">1 Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="line">Line Chart</SelectItem>
                                    <SelectItem value="area">Area Chart</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {trendData.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-2">No financial data available for the selected period.</p>
                            <p className="text-sm text-muted-foreground">
                                Add financial data through Financial Ledger, Payroll, or Expenses to see trends.
                            </p>
                        </div>
                    ) : (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'line' ? (
                                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip 
                                            formatter={(value, name) => [
                                                formatCurrency(value), 
                                                name === 'runningIncome' ? 'Income' : 
                                                name === 'runningExpenses' ? 'Expenses' : 
                                                name === 'runningPayroll' ? 'Payroll' : 
                                                name === 'netFlow' ? 'Net Flow' : name
                                            ]}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        />
                                        <Line type="monotone" dataKey="runningIncome" stroke="#10b981" strokeWidth={2} />
                                        <Line type="monotone" dataKey="runningExpenses" stroke="#ef4444" strokeWidth={2} />
                                        <Line type="monotone" dataKey="runningPayroll" stroke="#f59e0b" strokeWidth={2} />
                                        <Line type="monotone" dataKey="netFlow" stroke="#3b82f6" strokeWidth={3} />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis 
                                            dataKey="date" 
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis 
                                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip 
                                            formatter={(value, name) => [
                                                formatCurrency(value), 
                                                name === 'runningIncome' ? 'Income' : 
                                                name === 'totalSpent' ? 'Total Spent' : 
                                                name === 'netFlow' ? 'Net Flow' : name
                                            ]}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                        />
                                        <Area type="monotone" dataKey="runningIncome" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                        <Area type="monotone" dataKey="totalSpent" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Summary Stats */}
                    {trendData.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Income</p>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(trendData[trendData.length - 1]?.runningIncome || 0)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Expenses</p>
                                <p className="text-lg font-semibold text-red-600">
                                    {formatCurrency(trendData[trendData.length - 1]?.runningExpenses || 0)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Payroll</p>
                                <p className="text-lg font-semibold text-orange-600">
                                    {formatCurrency(trendData[trendData.length - 1]?.runningPayroll || 0)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Net Flow</p>
                                <p className={`text-lg font-semibold ${
                                    (trendData[trendData.length - 1]?.netFlow || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {formatCurrency(trendData[trendData.length - 1]?.netFlow || 0)}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default FinancialTrendsChart;
