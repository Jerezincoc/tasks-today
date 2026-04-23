import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
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
      setTasks(data ?? []);
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

    // Realtime subscription
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

  const addTask = async (title: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("tasks")
      .insert({ title, user_id: userId });
    if (error) {
      toast.error("Erro ao criar tarefa", { description: error.message });
    } else {
      toast.success("Tarefa criada");
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar tarefa", { description: error.message });
      // revert
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
