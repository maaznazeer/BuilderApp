import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
    import { useNavigate } from 'react-router-dom';
    import { cn } from '@/lib/utils';

    const KpiCard = ({ title, value, icon: Icon, link, isCurrency = false, color = 'text-primary' }) => {
        const navigate = useNavigate();

        const formattedValue = isCurrency 
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short' }).format(value || 0)
            : value;

        const cardVariants = {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
        };

        const handleClick = () => {
            if (link) {
                navigate(link);
            }
        };

        return (
            <motion.div variants={cardVariants} className="h-full">
                <Card 
                    className={cn(
                        "h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4",
                        link ? 'cursor-pointer' : '',
                        color === 'text-sky-500' && 'border-sky-500',
                        color === 'text-emerald-500' && 'border-emerald-500',
                        color === 'text-amber-500' && 'border-amber-500',
                        color === 'text-rose-500' && 'border-rose-500',
                    )}
                    onClick={handleClick}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                        {Icon && <Icon className={cn("h-5 w-5", color)} />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formattedValue ?? 'N/A'}</div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    };

    export default KpiCard;