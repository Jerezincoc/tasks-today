import { useMemo } from "react";
import type { Task } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListTodo, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getTaskStatus, sortTasks, type TaskStatus } from "@/lib/tasks";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

const TAB_META: Record<
  TaskStatus,
  { label: string; icon: typeof ListTodo; emptyTitle: string; emptyDesc: string }
> = {
  pending: {
    label: "Pendentes",
    icon: ListTodo,
    emptyTitle: "Nenhuma pendente",
    emptyDesc: "Crie uma nova tarefa para começar.",
  },
  "due-today": {
    label: "Vencendo hoje",
    icon: CalendarClock,
    emptyTitle: "Nada vencendo hoje",
    emptyDesc: "Você está em dia. ",
  },
  overdue: {
    label: "Em atraso",
    icon: AlertTriangle,
    emptyTitle: "Nenhuma em atraso",
    emptyDesc: "Tudo dentro do prazo.",
  },
  completed: {
    label: "Concluídas",
    icon: CheckCircle2,
    emptyTitle: "Nada concluído ainda",
    emptyDesc: "Marque tarefas como feitas e elas aparecem aqui.",
  },
};

const TAB_ORDER: TaskStatus[] = ["pending", "due-today", "overdue", "completed"];

export function TaskList({ tasks, loading, onToggle, onDelete }: TaskListProps) {
  const grouped = useMemo(() => {
    const buckets: Record<TaskStatus, Task[]> = {
      pending: [],
      "due-today": [],
      overdue: [],
      completed: [],
    };
    const now = new Date();
    for (const t of tasks) {
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
      <div className="space-y-2 mt-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
    <Tabs defaultValue={defaultTab} className="mt-6">
      <TabsList className="grid grid-cols-4 w-full h-auto">
        {TAB_ORDER.map((key) => {
          const Icon = TAB_META[key].icon;
          const count = grouped[key].length;
          return (
            <TabsTrigger
              key={key}
              value={key}
              className="flex flex-col sm:flex-row gap-1 sm:gap-2 py-2 text-xs sm:text-sm"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{TAB_META[key].label}</span>
              <span className="sm:hidden">{TAB_META[key].label.split(" ")[0]}</span>
              <span className="text-[10px] font-semibold opacity-70">({count})</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {TAB_ORDER.map((key) => {
        const list = grouped[key];
        const meta = TAB_META[key];
        const Icon = meta.icon;
        return (
          <TabsContent key={key} value={key} className="mt-4">
            {list.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-content-center mb-3">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{meta.emptyTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{meta.emptyDesc}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {list.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
