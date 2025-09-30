import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Plus, Copy, Trash2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const statusColorMap = {
  "Not Started": "slate",
  "In Progress": "default",
  "Done": "success",
  "Completed": "success",
  "Delayed": "destructive",
  "On Hold": "warning",
};

const getStatusColor = (status) => statusColorMap[status] || "gray";

const WbsTreeItem = ({ node, isExpanded, onToggle, isSelected, onSelect }) => {
  const { toast } = useToast();

  const handleAction = (e, actionName) => {
    e.stopPropagation();
    toast({
      title: `🚧 ${actionName}`,
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const handleRowClick = () => {
    onSelect(node.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "group flex items-center w-full text-sm rounded-md hover:bg-accent/50 pr-2 transition-colors",
        isSelected && "bg-accent"
      )}
      style={{ paddingLeft: `${(node.level || 1) * 16}px` }}
      onClick={handleRowClick}
    >
      {node.type === 'Summary' ? (
        <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="p-1 rounded-sm hover:bg-accent -ml-5 mr-1">
          <ChevronRight
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
          />
        </button>
      ) : (
        <div className="w-5 flex-shrink-0" />
      )}

      <div className="flex-grow flex items-center gap-2 py-1 cursor-pointer truncate">
        <span className="font-semibold truncate flex-shrink min-w-0" title={node.name}>
          {node.name}
        </span>
        {node.phase && (
          <Badge variant="secondary" className="flex-shrink-0 font-normal">{node.phase}</Badge>
        )}
        {node.status && (
          <Badge variant={getStatusColor(node.status)} className="flex-shrink-0 font-normal">{node.status}</Badge>
        )}
      </div>
      
      <div className="flex-shrink-0 w-24 mx-2 flex items-center gap-2">
         <Progress value={node.percent_complete || 0} className="h-1.5 w-full" />
         <span className="text-xs text-muted-foreground w-8 text-right">{node.percent_complete || 0}%</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={(e) => handleAction(e, 'Add child task')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleAction(e, 'Duplicate task')}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={(e) => handleAction(e, 'Delete task')}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default WbsTreeItem;