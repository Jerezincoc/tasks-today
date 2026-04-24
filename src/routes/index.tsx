import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTasks } from "@/hooks/useTasks";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-screen grid place-content-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 relative">
      <Header email={user.email ?? ""} onSignOut={signOut} />
      
      <main className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex-1 min-w-[200px]"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
              Suas Tarefas
            </h1>
            <p className="text-base text-muted-foreground/80 font-medium">
              Organize por prazo, prioridade e acompanhe suas metas.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
          >
            <TaskForm onAdd={addTask} />
          </motion.div>
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
