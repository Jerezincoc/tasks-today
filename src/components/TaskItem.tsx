import { useState } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, X, Check, Clock, AlertTriangle } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_STYLES, getTaskStatus } from "@/lib/tasks";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

function formatDue(iso: string): string {
  const d = new Date(iso);
  const time = format(d, "HH:mm");
  if (isToday(d)) return `Hoje, ${time}`;
  if (isTomorrow(d)) return `Amanhã, ${time}`;
  if (isYesterday(d)) return `Ontem, ${time}`;
  return format(d, "dd MMM, HH:mm", { locale: ptBR });
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [confirming, setConfirming] = useState(false);
  const status = getTaskStatus(task);
  const isOverdue = status === "overdue";
  const isDueToday = status === "due-today" && !task.completed;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border bg-card transition-all",
        "hover:shadow-sm",
        task.completed
          ? "border-border opacity-60"
          : isOverdue
            ? "border-[var(--status-overdue)]/40 hover:border-[var(--status-overdue)]/60"
            : isDueToday
              ? "border-[var(--status-due-today)]/40 hover:border-[var(--status-due-today)]/60"
              : "border-border hover:border-primary/30",
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(v) => onToggle(task.id, Boolean(v))}
        className="h-5 w-5 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span
            className={cn(
              "text-sm text-foreground transition-all break-words flex-1 min-w-0",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap",
              PRIORITY_STYLES[task.priority],
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.description && (
          <p
            className={cn(
              "text-xs text-muted-foreground mt-1 break-words",
              task.completed && "line-through",
            )}
          >
            {task.description}
          </p>
        )}
        {task.due_date && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1.5 text-xs",
              task.completed
                ? "text-muted-foreground"
                : isOverdue
                  ? "text-[var(--status-overdue)] font-medium"
                  : isDueToday
                    ? "text-[var(--status-due-today)] font-medium"
                    : "text-muted-foreground",
            )}
          >
            {isOverdue ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{formatDue(task.due_date)}</span>
            {isOverdue && <span className="ml-1">• em atraso</span>}
          </div>
        )}
      </div>
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
          className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => setConfirming(true)}
          aria-label="Deletar tarefa"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
