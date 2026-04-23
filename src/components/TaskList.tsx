import { useState, useMemo } from "react";
import type { Task } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, loading, onToggle, onDelete }: TaskListProps) {
  const [showCompleted, setShowCompleted] = useState(true);

  const { pending, completed } = useMemo(() => {
    return {
      pending: tasks.filter((t) => !t.completed),
      completed: tasks.filter((t) => t.completed),
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-2 mt-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-12 text-center py-12 px-4 rounded-xl border border-dashed border-border">
        <div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-content-center mb-3">
          <ListTodo className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Nenhuma tarefa ainda</p>
        <p className="text-xs text-muted-foreground mt-1">
          Adicione sua primeira tarefa acima para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {pending.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Pendentes ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <button
            onClick={() => setShowCompleted((s) => !s)}
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1 hover:text-foreground transition-colors"
          >
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", !showCompleted && "-rotate-90")}
            />
            Concluídas ({completed.length})
          </button>
          {showCompleted && (
            <div className="space-y-2">
              {completed.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
