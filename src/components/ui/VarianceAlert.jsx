import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    TrendingUp, 
    TrendingDown,
    AlertTriangle, 
    CheckCircle, 
    X,
    Info,
    DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VarianceAlert = ({ 
    type = 'info', 
    title, 
    message, 
    amount, 
    percentage, 
    category = 'total',
    onDismiss, 
    onViewDetails,
    dismissible = true 
}) => {
    const getAlertConfig = () => {
        switch (type) {
            case 'critical':
                return {
                    variant: 'destructive',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    bgColor: 'bg-red-50 border-red-200',
                    textColor: 'text-red-800',
                    badge: <Badge variant="destructive">Critical Variance</Badge>
                };
            case 'warning':
                return {
                    variant: 'default',
                    icon: <AlertTriangle className="h-4 w-4" />,
                    bgColor: 'bg-orange-50 border-orange-200',
                    textColor: 'text-orange-800',
                    badge: <Badge variant="secondary" className="bg-orange-100 text-orange-800">Warning</Badge>
                };
            case 'success':
                return {
                    variant: 'default',
                    icon: <CheckCircle className="h-4 w-4" />,
                    bgColor: 'bg-green-50 border-green-200',
                    textColor: 'text-green-800',
                    badge: <Badge variant="secondary" className="bg-green-100 text-green-800">Positive</Badge>
                };
            default:
                return {
                    variant: 'default',
                    icon: <Info className="h-4 w-4" />,
                    bgColor: 'bg-blue-50 border-blue-200',
                    textColor: 'text-blue-800',
                    badge: <Badge variant="outline">Variance</Badge>
                };
        }
    };

    const config = getAlertConfig();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const getVarianceIcon = (amount) => {
        if (amount > 0) return <TrendingUp className="h-3 w-3 text-red-600" />;
        if (amount < 0) return <TrendingDown className="h-3 w-3 text-green-600" />;
        return <CheckCircle className="h-3 w-3 text-blue-600" />;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
            >
                <Alert className={`${config.bgColor} border-l-4 ${config.textColor}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                                {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold">{title}</h4>
                                    {config.badge}
                                </div>
                                <AlertDescription className={config.textColor}>
                                    {message}
                                </AlertDescription>
                                
                                {(amount || percentage) && (
                                    <div className="mt-2 flex items-center gap-4 text-sm">
                                        {amount && (
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-3 w-3" />
                                                <span className="font-medium">{formatCurrency(amount)}</span>
                                            </div>
                                        )}
                                        {percentage && (
                                            <div className="flex items-center gap-1">
                                                {getVarianceIcon(amount)}
                                                <span className="font-medium">{percentage.toFixed(1)}%</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {onViewDetails && (
                                    <div className="mt-3">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={onViewDetails}
                                            className="text-xs"
                                        >
                                            View Variance Details
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {dismissible && onDismiss && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDismiss}
                                className="flex-shrink-0 ml-2 h-6 w-6 p-0"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </Alert>
            </motion.div>
        </AnimatePresence>
    );
};

export default VarianceAlert;
