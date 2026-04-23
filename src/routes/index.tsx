import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useTasks(user?.id);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen grid place-content-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user.email ?? ""} onSignOut={signOut} />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Suas tarefas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize por prazo, prioridade e acompanhe o que está vencendo.
            </p>
          </div>
          <TaskForm onAdd={addTask} />
        </div>
        <TaskList
          tasks={tasks}
          loading={tasksLoading}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      </main>
    </div>
  );
}
