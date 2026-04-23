import type { Task } from "@/hooks/useTasks";

export type Priority = "baixa" | "media" | "alta" | "urgente";

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgente: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};

export const PRIORITY_STYLES: Record<Priority, string> = {
  baixa: "bg-[var(--priority-baixa-bg)] text-[var(--priority-baixa)] border-[var(--priority-baixa)]/30",
  media: "bg-[var(--priority-media-bg)] text-[var(--priority-media)] border-[var(--priority-media)]/30",
  alta: "bg-[var(--priority-alta-bg)] text-[var(--priority-alta)] border-[var(--priority-alta)]/30",
  urgente:
    "bg-[var(--priority-urgente-bg)] text-[var(--priority-urgente)] border-[var(--priority-urgente)]/40",
};

export type TaskStatus = "pending" | "due-today" | "overdue" | "completed";

export function getTaskStatus(task: Task, now: Date = new Date()): TaskStatus {
  if (task.completed) return "completed";
  if (!task.due_date) return "pending";
  const due = new Date(task.due_date);
  if (due.getTime() < now.getTime()) {
    // Overdue if due time is in the past
    const sameDay =
      due.getFullYear() === now.getFullYear() &&
      due.getMonth() === now.getMonth() &&
      due.getDate() === now.getDate();
    return sameDay ? "due-today" : "overdue";
  }
  // Due today (future hour today)
  if (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate()
  ) {
    return "due-today";
  }
  return "pending";
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Tasks without due_date come last among same priority
    const pa = PRIORITY_ORDER[a.priority];
    const pb = PRIORITY_ORDER[b.priority];
    if (pa !== pb) return pa - pb;
    if (a.due_date && b.due_date) {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
