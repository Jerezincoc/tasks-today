import { useState } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, X, Check, Clock, AlertTriangle } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_STYLES, getTaskStatus } from "@/lib/tasks";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.015 }}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-2xl border bg-card/60 backdrop-blur-md shadow-sm transition-all duration-300",
        task.completed
          ? "border-border/30 opacity-50 grayscale-[0.3]"
          : isOverdue
            ? "border-[var(--status-overdue)]/50 shadow-[var(--status-overdue)]/10 hover:shadow-[var(--status-overdue)]/20 hover:border-[var(--status-overdue)]"
            : isDueToday
              ? "border-[var(--status-due-today)]/50 shadow-[var(--status-due-today)]/10 hover:shadow-[var(--status-due-today)]/20 hover:border-[var(--status-due-today)]"
              : "border-border/50 hover:border-primary/50 hover:shadow-primary/10 shadow-black/5",
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(v) => onToggle(task.id, Boolean(v))}
        className="h-6 w-6 mt-0.5 rounded-full border-2 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={cn(
              "text-base font-medium text-foreground transition-all break-words flex-1 min-w-0",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm whitespace-nowrap",
              PRIORITY_STYLES[task.priority],
            )}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
        {task.description && (
          <p
            className={cn(
              "text-sm text-foreground/70 mt-1.5 break-words line-clamp-2",
              task.completed && "line-through opacity-70",
            )}
          >
            {task.description}
          </p>
        )}
        {task.due_date && (
          <div
            className={cn(
              "flex items-center gap-1.5 mt-3 text-xs font-medium px-2 py-1 bg-background/50 rounded-md w-fit border border-border/30",
              task.completed
                ? "text-muted-foreground"
                : isOverdue
                  ? "text-[var(--status-overdue)]"
                  : isDueToday
                    ? "text-[var(--status-due-today)]"
                    : "text-muted-foreground",
            )}
          >
            {isOverdue ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            <span>{formatDue(task.due_date)}</span>
            {isOverdue && <span className="ml-1 opacity-80 uppercase text-[10px] tracking-wider font-bold">• Vencida</span>}
          </div>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        {confirming ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1"
          >
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 rounded-full shadow-lg shadow-destructive/20"
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
              variant="outline"
              className="h-8 w-8 rounded-full bg-background/50 backdrop-blur"
              onClick={() => setConfirming(false)}
              aria-label="Cancelar"
            >
              <X className="h-4 w-4 text-foreground/80" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => setConfirming(true)}
              aria-label="Deletar tarefa"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
