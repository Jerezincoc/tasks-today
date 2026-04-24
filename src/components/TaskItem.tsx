import { useState } from "react";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, X, Check, Clock, AlertTriangle, Tag as TagIcon, Repeat, Target } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_STYLES, getTaskStatus } from "@/lib/tasks";
import { motion, AnimatePresence } from "framer-motion";
import { TaskForm } from "./TaskForm";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onFocus?: (task: Task) => void;
}

function formatDue(iso: string): string {
  const d = new Date(iso);
  const time = format(d, "HH:mm");
  if (isToday(d)) return `Hoje, ${time}`;
  if (isTomorrow(d)) return `Amanhã, ${time}`;
  if (isYesterday(d)) return `Ontem, ${time}`;
  return format(d, "dd MMM, HH:mm", { locale: ptBR });
}

export function TaskItem({ task, onToggle, onUpdate, onDelete, onFocus }: TaskItemProps) {
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
        className="h-6 w-6 mt-0.5 rounded-full border-2 transition-colors data-[state=checked]:bg-primary data-[state=checked]:border-primary shrink-0"
      />
      
      <TaskForm
        initialData={task}
        onSave={async (updates) => {
          onUpdate(task.id, updates);
        }}
        trigger={
          <button className="flex-1 min-w-0 text-left cursor-text outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md p-1 -m-1 relative z-0">
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
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {task.due_date && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-background/50 rounded-md w-fit border border-border/30",
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

              {task.recurrence && task.recurrence !== 'none' && (
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/30">
                  <Repeat className="h-3 w-3" />
                  {task.recurrence}
                </div>
              )}

              {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
                  <TagIcon className="h-3 w-3" />
                  {tag}
                </div>
              ))}
            </div>
          </button>
        }
      />

      <AnimatePresence mode="popLayout">
        {confirming ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 shadow-sm ml-2 bg-background/50 rounded-full border border-border p-1 relative z-20"
          >
             <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-2 mr-1">Deletar?</span>
            <Button
              size="icon"
              variant="destructive"
              className="h-7 w-7 rounded-full shadow-lg shadow-destructive/20"
              onClick={() => {
                onDelete(task.id);
                setConfirming(false);
              }}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-full bg-background/50 backdrop-blur"
              onClick={() => setConfirming(false)}
            >
              <X className="h-3.5 w-3.5 text-foreground/80" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0 flex items-center gap-1 relative z-20"
          >
            {onFocus && !task.completed && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/20 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
                onClick={() => onFocus(task)}
                aria-label="Focar tarefa"
              >
                <Target className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors border border-transparent hover:border-destructive/20"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
