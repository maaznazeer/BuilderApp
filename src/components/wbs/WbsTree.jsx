import React, { useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import WbsTreeItem from '@/components/wbs/WbsTreeItem';
import { ScrollArea } from '@/components/ui/scroll-area';

const WbsTree = ({ tasks, selectedTaskId, setSelectedTaskId }) => {
  const [expandedNodes, setExpandedNodes] = useLocalStorage('wbs-expanded-nodes', []);

  const taskTree = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    const taskMap = new Map(tasks.map(task => [task.wbs, { ...task, children: [] }]));
    const roots = [];

    // Sort tasks by WBS to ensure parents are processed before children
    const sortedTasks = [...tasks].sort((a, b) => a.wbs.localeCompare(b.wbs, undefined, { numeric: true }));

    sortedTasks.forEach(task => {
      const node = taskMap.get(task.wbs);
      if (!node) return;

      const parentWbs = task.wbs.substring(0, task.wbs.lastIndexOf('.'));
      
      if (parentWbs && taskMap.has(parentWbs)) {
        const parentNode = taskMap.get(parentWbs);
        if (parentNode) {
            parentNode.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [tasks]);

  const toggleNode = useCallback((wbs) => {
    setExpandedNodes(prev =>
      prev.includes(wbs) ? prev.filter(id => id !== wbs) : [...prev, wbs]
    );
  }, [setExpandedNodes]);

  const renderTree = (nodes) => {
    return nodes.flatMap(node => {
      const isExpanded = node.type === 'Summary' && expandedNodes.includes(node.wbs);
      const isSelected = node.id === selectedTaskId;
      
      const renderedNode = (
        <WbsTreeItem
          key={node.id}
          node={node}
          isExpanded={isExpanded}
          onToggle={() => toggleNode(node.wbs)}
          isSelected={isSelected}
          onSelect={setSelectedTaskId}
        />
      );

      const children = isExpanded && node.children.length > 0 ? renderTree(node.children) : [];
      
      return [renderedNode, ...children];
    });
  };

  return (
    <div className="p-2 space-y-px">
        <AnimatePresence>
            {renderTree(taskTree)}
        </AnimatePresence>
    </div>
  );
};

export default WbsTree;