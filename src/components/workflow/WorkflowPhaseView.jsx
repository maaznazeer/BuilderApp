import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, X } from 'lucide-react';
import ModuleLinks from './ModuleLinks';
import { useToast } from '@/components/ui/use-toast';

const WorkflowPhaseView = ({ phaseKey, steps, onEdit, onDelete }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const phaseName = phaseKey.substring(phaseKey.indexOf('-') + 1);
  const userRole = profile?.app_role;
  const isApprover = userRole === 'Owner' || userRole === 'Homebuilder' || userRole === 'Admin';

  const handleApprovalAction = (action) => {
    toast({
        title: "🚧 Action Recorded!",
        description: `This "${action}" action is for demonstration purposes. Full approval logic can be implemented next.`,
    });
  };

  return (
    <AccordionItem value={phaseKey}>
      <AccordionTrigger className="text-xl font-semibold text-gray-700 hover:bg-gray-50 p-4 justify-start rounded-t-lg">
        {phaseName}
      </AccordionTrigger>
      <AccordionContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[5%]">Order</TableHead>
                <TableHead>Step Name</TableHead>
                <TableHead>Key Actions</TableHead>
                <TableHead>Linked Modules</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.sort((a, b) => a.step_order - b.step_order).map(step => (
                <TableRow key={step.id}>
                  <TableCell>{step.step_order}</TableCell>
                  <TableCell className="font-medium">{step.step_name}</TableCell>
                  <TableCell className="text-sm text-gray-600 truncate max-w-xs">{step.key_actions_requirements}</TableCell>
                  <TableCell>
                    <ModuleLinks modules={step.linked_modules} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={step.approval_required !== 'None' ? 'secondary' : 'outline'}>
                      {step.approval_required}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {step.auto_reminder ? (
                      <Badge variant="success">On</Badge>
                    ) : (
                      <Badge variant="outline">Off</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {isApprover && step.approval_required !== 'None' && (
                        <>
                            <Button variant="success" size="icon" onClick={() => handleApprovalAction('Approve')}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleApprovalAction('Request Changes')}>
                                <X className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onEdit(step)}>
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(step.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default WorkflowPhaseView;