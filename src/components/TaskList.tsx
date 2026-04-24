import { useMemo } from "react";
import type { Task } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListTodo, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getTaskStatus, sortTasks, type TaskStatus } from "@/lib/tasks";
import { motion, AnimatePresence } from "framer-motion";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

const TAB_META: Record<
  TaskStatus,
  { label: string; icon: typeof ListTodo; emptyTitle: string; emptyDesc: string }
> = {
  pending: {
    label: "Pendentes",
    icon: ListTodo,
    emptyTitle: "Nenhuma pendente",
    emptyDesc: "Crie uma nova tarefa para começar a organizar seu dia.",
  },
  "due-today": {
    label: "Vencendo hoje",
    icon: CalendarClock,
    emptyTitle: "Nada vencendo hoje",
    emptyDesc: "Seu dia está tranquilo (ou você já fez tudo!).",
  },
  overdue: {
    label: "Em atraso",
    icon: AlertTriangle,
    emptyTitle: "Nenhuma em atraso",
    emptyDesc: "Parabéns, você está mantendo tudo dentro do prazo.",
  },
  completed: {
    label: "Concluídas",
    icon: CheckCircle2,
    emptyTitle: "Nada concluído ainda",
    emptyDesc: "Marque tarefas como feitas para celebrar o check.",
  },
};

const TAB_ORDER: TaskStatus[] = ["pending", "due-today", "overdue", "completed"];

export function TaskList({ tasks, loading, onToggle, onDelete, onUpdate }: TaskListProps) {
  const grouped = useMemo(() => {
    const buckets: Record<TaskStatus, Task[]> = {
      pending: [],
      "due-today": [],
      overdue: [],
      completed: [],
    };
    const now = new Date();
    for (const t of tasks) {
      if (t.archived) continue;
      buckets[getTaskStatus(t, now)].push(t);
    }
    (Object.keys(buckets) as TaskStatus[]).forEach((k) => {
      buckets[k] =
        k === "completed"
          ? [...buckets[k]].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )
          : sortTasks(buckets[k]);
    });
    return buckets;
  }, [tasks]);

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl bg-card/40" />
        ))}
      </div>
    );
  }

  const defaultTab: TaskStatus =
    grouped.overdue.length > 0
      ? "overdue"
      : grouped["due-today"].length > 0
        ? "due-today"
        : "pending";

  return (
    <Tabs defaultValue={defaultTab} className="mt-8">
      <TabsList className="grid grid-cols-4 w-full h-auto bg-card/30 p-1.5 rounded-xl backdrop-blur-md border border-white/5 shadow-inner">
        {TAB_ORDER.map((key) => {
          const Icon = TAB_META[key].icon;
          const count = grouped[key].length;
          return (
            <TabsTrigger
              key={key}
              value={key}
              className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">{TAB_META[key].label}</span>
              <span className="sm:hidden font-medium">{TAB_META[key].label.split(" ")[0]}</span>
              {count > 0 && <span className="text-[10px] sm:bg-background/20 sm:px-1.5 sm:py-0.5 rounded-md font-bold">({count})</span>}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TAB_ORDER.map((key) => {
        const list = grouped[key];
        const meta = TAB_META[key];
        const Icon = meta.icon;
        return (
          <TabsContent key={key} value={key} className="mt-6 focus-visible:ring-0">
            {list.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-card/20 backdrop-blur-sm"
              >
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted/30 grid place-content-center mb-4 shadow-inner">
                  <Icon className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <p className="text-base font-semibold text-foreground/80">{meta.emptyTitle}</p>
                <p className="text-sm text-muted-foreground/60 mt-2 max-w-[250px] mx-auto">{meta.emptyDesc}</p>
              </motion.div>
            ) : (
              <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {list.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
