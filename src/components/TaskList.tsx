import { Task } from '@/types/project';
import { TaskItem } from '@/components/TaskItem';

interface TaskListProps {
  stage: string;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskSelection: (taskId: string | null) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskRename: (taskId: string, newName: string) => void;
  selectedTaskId: string | null;
}

export function TaskList({ stage, tasks, onTaskUpdate, onTaskSelection, onTaskDelete, onTaskRename, selectedTaskId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        <p>No task in this phase yet.</p>
        <p className="mt-1 text-sm">Click "Add Task" to create your first task.</p>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto max-h-[65vh] p-1">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onTaskUpdate={onTaskUpdate}
          onTaskSelection={onTaskSelection}
          onTaskDelete={onTaskDelete}
          onTaskRename={onTaskRename}
          isSelected={selectedTaskId === task.id}
        />
      ))}
    </div>
  );
}
