import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, X, Check } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border border-border bg-card transition-all",
        "hover:border-primary/30 hover:shadow-sm",
        task.completed && "opacity-60",
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(v) => onToggle(task.id, Boolean(v))}
        className="h-5 w-5"
      />
      <span
        className={cn(
          "flex-1 text-sm text-foreground transition-all break-words",
          task.completed && "line-through text-muted-foreground",
        )}
      >
        {task.title}
      </span>
      {confirming ? (
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => {
              onDelete(task.id);
              setConfirming(false);
            }}
            aria-label="Confirmar exclusão"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setConfirming(false)}
            aria-label="Cancelar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
          aria-label="Deletar tarefa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
