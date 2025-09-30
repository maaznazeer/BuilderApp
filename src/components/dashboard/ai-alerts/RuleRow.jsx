import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Mail, MessageSquare, AlertTriangle, CloudRain, CircleDollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';


const RULE_CONFIG = {
    StageDelay: {
        icon: AlertTriangle,
        title: "Stage Delay",
        description: "If progress is behind baseline.",
        color: "text-orange-500",
        params: {
            percentage: { type: 'number', label: 'By %', defaultValue: 10 },
            days: { type: 'number', label: 'For Days', defaultValue: 7 },
        }
    },
    SeasonRisk: {
        icon: CloudRain,
        title: "Seasonal Risk",
        description: "If in a risky season.",
        color: "text-blue-500",
        params: {
            season: { type: 'select', label: 'Season', options: ['Rainy', 'Dry', 'Harmattan'], defaultValue: 'Rainy' },
            stage: { type: 'select', label: 'Stage', options: ['Outdoor', 'Foundation', 'Roofing'], defaultValue: 'Outdoor' },
        }
    },
    CostOverrun: {
        icon: CircleDollarSign,
        title: "Cost Overrun",
        description: "If EAC exceeds budget.",
        color: "text-red-500",
        params: {
            percentage: { type: 'number', label: 'By %', defaultValue: 5 },
        }
    }
};


const RuleRow = ({ rule, onChange, onRemove }) => {
    const config = RULE_CONFIG[rule.rule_type];
    const { toast } = useToast();

    if (!config) return null;

    const handleParamChange = (param, value) => {
        const newParams = { ...rule.parameters, [param]: value };
        onChange(rule.id, { parameters: newParams });
    };
    
    const handleWhatsappToggle = () => {
        toast({
            title: "Coming Soon!",
            description: "WhatsApp notifications are not yet available but are planned for a future update.",
        });
    }

    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 border rounded-lg space-y-4 bg-background/50"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 mt-1 ${config.color}`} />
                    <div>
                        <h4 className="font-semibold">{config.title}</h4>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => onChange(rule.id, { is_active: checked })}
                    />
                     <Button variant="ghost" size="icon" onClick={() => onRemove(rule.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-9">
                {Object.entries(config.params).map(([paramKey, paramConfig]) => (
                    <div key={paramKey} className="space-y-1.5">
                        <Label className="text-xs">{paramConfig.label}</Label>
                        {paramConfig.type === 'number' && (
                            <Input
                                type="number"
                                value={rule.parameters[paramKey] || paramConfig.defaultValue}
                                onChange={(e) => handleParamChange(paramKey, e.target.value)}
                                className="h-8"
                            />
                        )}
                        {paramConfig.type === 'select' && (
                             <Select
                                value={rule.parameters[paramKey] || paramConfig.defaultValue}
                                onValueChange={(value) => handleParamChange(paramKey, value)}
                            >
                                <SelectTrigger className="h-8">
                                    <SelectValue placeholder={`Select ${paramConfig.label}`} />
                                </SelectTrigger>
                                <SelectContent>
                                    {paramConfig.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="flex items-center justify-end gap-4 pt-2">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Switch size="sm" 
                        checked={rule.notify_email}
                        onCheckedChange={(checked) => onChange(rule.id, { notify_email: checked })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Switch size="sm" 
                        checked={rule.notify_whatsapp}
                        onCheckedChange={handleWhatsappToggle}
                    />
                </div>
            </div>

        </motion.div>
    );
};

export default RuleRow;