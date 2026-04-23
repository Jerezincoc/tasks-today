import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Priority } from "@/lib/tasks";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  due_date: string | null;
  priority: Priority;
}

export interface NewTaskInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: Priority;
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar tarefas", { description: error.message });
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    loadTasks();

    const channel = supabase
      .channel(`tasks-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => {
              const next = payload.new as Task;
              if (prev.some((t) => t.id === next.id)) return prev;
              return [next, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const next = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === next.id ? next : t)));
          } else if (payload.eventType === "DELETE") {
            const old = payload.old as Task;
            setTasks((prev) => prev.filter((t) => t.id !== old.id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadTasks]);

  const addTask = async (input: NewTaskInput) => {
    if (!userId) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      due_date: input.due_date ?? null,
      priority: input.priority,
    });
    if (error) {
      toast.error("Erro ao criar tarefa", { description: error.message });
    } else {
      toast.success("Tarefa criada");
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    const { error } = await supabase.from("tasks").update({ completed }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar tarefa", { description: error.message });
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao deletar tarefa", { description: error.message });
    } else {
      toast.success("Tarefa removida");
    }
  };

  return { tasks, loading, addTask, toggleTask, deleteTask };
}
