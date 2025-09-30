import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const computeSchedule = (tasks) => {
  if (!tasks || tasks.length === 0) return { changed: [], finalTasks: tasks };
  
  const byWbs = new Map(tasks.map(t => [t.wbs, t]));
  const byId = new Map(tasks.map(t => [t.id, t]));
  const dur = (t) => (t.type === "Milestone" ? 0 : Number(t.duration_days || 0));
  
  const preds = (t) => String(t.predecessors || "")
      .split(",").map(s => s.trim()).filter(Boolean)
      .map(wbs => byWbs.get(wbs)?.id)
      .filter(id => id && byId.has(id));

  const inDeg = new Map(tasks.map(t => [t.id, preds(t).length]));
  const start = new Map(tasks.map(t => [t.id, Number(t.start_offset_days || 0)]));
  
  const q = tasks.filter(t => inDeg.get(t.id) === 0).map(t => t.id);
  const end = new Map();

  const sortedTaskIds = [];
  while(q.length > 0) {
      const u_id = q.shift();
      if(u_id === undefined) continue;
      sortedTaskIds.push(u_id);

      const u_task = byId.get(u_id);
      if(!u_task) continue;

      const u_start = start.get(u_id);
      const u_end = u_start + dur(u_task) - (dur(u_task) > 0 ? 1 : 0);
      end.set(u_id, u_end);
      
      for (const v_task of tasks) {
          if (String(v_task.predecessors || "").split(',').map(s => s.trim()).includes(u_task.wbs)) {
              const v_id = v_task.id;
              const current_v_start = start.get(v_id) || 0;
              start.set(v_id, Math.max(current_v_start, u_end + 1));
              
              const new_inDeg = (inDeg.get(v_id) || 0) - 1;
              inDeg.set(v_id, new_inDeg);

              if (new_inDeg === 0) {
                  q.push(v_id);
              }
          }
      }
  }

  if (sortedTaskIds.length !== tasks.length) {
    console.error("Circular dependency detected. Scheduling aborted.");
    return { changed: [], error: 'Circular dependency detected.', finalTasks: tasks };
  }
  
  const changed = [];
  const finalTasks = JSON.parse(JSON.stringify(tasks));
  const finalTasksById = new Map(finalTasks.map(t => [t.id, t]));

  // Recalculate all tasks based on sorted order
  for (const taskId of sortedTaskIds) {
      const task = finalTasksById.get(taskId);
      if (task.type === "Summary") continue;

      let newStart = 0;
      const predecessorIds = preds(task);
      for(const predId of predecessorIds) {
          const predTask = finalTasksById.get(predId);
          newStart = Math.max(newStart, (predTask.end_offset_days || 0) + 1);
      }
      task.start_offset_days = newStart;
      task.end_offset_days = newStart + dur(task) - (dur(task) > 0 ? 1 : 0);
  }

  // Update summaries and collect changes
  for (const t of finalTasks) {
    const originalTask = byId.get(t.id);
    if (t.type === "Summary") {
      const pref = t.wbs + ".";
      const kids = finalTasks.filter(k => String(k.wbs || "").startsWith(pref) && k.type !== 'Summary');
      if (kids.length > 0) {
        const s = Math.min(...kids.map(k => k.start_offset_days));
        const e = Math.max(...kids.map(k => k.end_offset_days));
        t.start_offset_days = s;
        t.end_offset_days = e;
      }
    }
    
    if (originalTask.start_offset_days !== t.start_offset_days || originalTask.end_offset_days !== t.end_offset_days) {
        changed.push({ id: t.id, start_offset_days: t.start_offset_days, end_offset_days: t.end_offset_days });
    }
  }

  return { changed, finalTasks };
}


export const useWbsScheduler = (projectCode, initialTasks, autoSchedule, refetch) => {
    const { toast } = useToast();
    const [tasks, setTasks] = useState(initialTasks || []);

    useEffect(() => {
        setTasks(initialTasks || []);
    }, [initialTasks]);
    
    const scheduleAllTasks = useCallback(async () => {
        const currentTasks = tasks;
        if (!currentTasks || currentTasks.length === 0) return;
    
        const { changed, finalTasks, error: scheduleError } = computeSchedule(currentTasks);

        if (scheduleError) {
             toast({
                title: 'Scheduling Error',
                description: scheduleError,
                variant: 'destructive',
            });
            return;
        }
    
        if (changed.length > 0) {
            setTasks(finalTasks);
            
            const { error } = await supabase.from('wbs_tasks').upsert(changed, { onConflict: 'id,project_code'});

            if (error) {
                toast({
                    title: 'Error Saving Schedule',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Schedule Recalculated',
                    description: `${changed.length} task(s) were updated.`,
                });
            }
        } else {
            toast({
                title: 'No Changes',
                description: 'The schedule is already optimized.',
            });
        }
        refetch();
    
    }, [tasks, projectCode, toast, refetch]);

    const updateAndSaveTask = useCallback(async (taskId, updates) => {
        const editedTask = tasks.find(t => String(t.id) === String(taskId));
        if (!editedTask) return;

        const updatedTasks = tasks.map(task =>
            String(task.id) === String(taskId) ? { ...task, ...updates } : task
        );
        
        setTasks(updatedTasks);
        
        let changesToPatch = [];
        let resultingTasks = updatedTasks;

        if (autoSchedule) {
            const { changed, finalTasks, error: scheduleError } = computeSchedule(updatedTasks);

            if (scheduleError) {
                toast({ title: 'Scheduling Error', description: scheduleError, variant: 'destructive' });
                refetch();
                return;
            }
            changesToPatch = changed;
            resultingTasks = finalTasks;
            // Also include the original non-date updates in the patch
            const otherUpdates = Object.keys(updates)
              .filter(key => !['start_offset_days', 'end_offset_days'].includes(key))
              .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
              }, {});

            if(Object.keys(otherUpdates).length > 0) {
              const existingChange = changesToPatch.find(c => c.id === taskId);
              if (existingChange) {
                  Object.assign(existingChange, otherUpdates);
              } else {
                  changesToPatch.push({ id: taskId, ...otherUpdates });
              }
            }
        } else {
            changesToPatch = [{ id: taskId, ...updates }];
        }
        
        setTasks(resultingTasks);

        if (changesToPatch.length > 0) {
            const { error } = await supabase.from('wbs_tasks').upsert(changesToPatch, { onConflict: 'id,project_code' });

            if (error) {
                toast({ title: 'Error Saving Changes', description: error.message, variant: 'destructive' });
            } else {
                const message = autoSchedule ? 'Task Updated & Schedule Recalculated' : 'Task Updated';
                toast({ title: message });
            }
        } else if (!autoSchedule) {
           toast({ title: 'Task Updated' });
        } else {
           toast({ title: 'No schedule changes required.' });
        }

        refetch();

    }, [tasks, autoSchedule, projectCode, refetch, toast]);

    return { tasks, setTasks, updateAndSaveTask, scheduleAllTasks };
};