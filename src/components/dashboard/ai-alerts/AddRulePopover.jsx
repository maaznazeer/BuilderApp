import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PlusCircle, AlertTriangle, CloudRain, CircleDollarSign } from 'lucide-react';

const ruleTypes = [
    {
        type: 'StageDelay',
        icon: AlertTriangle,
        title: "Stage Delay",
        description: "If progress falls behind baseline."
    },
    {
        type: 'SeasonRisk',
        icon: CloudRain,
        title: "Seasonal Risk",
        description: "For outdoor work during risky seasons."
    },
    {
        type: 'CostOverrun',
        icon: CircleDollarSign,
        title: "Cost Overrun",
        description: "If EAC exceeds budget by a set %."
    }
];

const AddRulePopover = ({ onAddRule }) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (ruleType) => {
        onAddRule(ruleType);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full mt-2 border-dashed">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Alert Rule
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0">
                <div className="p-2 space-y-1">
                    {ruleTypes.map((rule) => {
                        const Icon = rule.icon;
                        return (
                            <button
                                key={rule.type}
                                onClick={() => handleSelect(rule.type)}
                                className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-accent text-left"
                            >
                                <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{rule.title}</p>
                                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default AddRulePopover;