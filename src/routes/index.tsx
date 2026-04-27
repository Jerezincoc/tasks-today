import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { useTasks } from "@/hooks/useTasks";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CalendarBoard } from "@/components/CalendarBoard";
import { FocusMode } from "@/components/FocusMode";
import { Onboarding } from "@/components/Onboarding";
import { DashboardStats } from "@/components/DashboardStats";
import { FilterBar } from "@/components/FilterBar";
import { Loader2, KanbanSquare, LayoutList, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferences } from "@/hooks/usePreferences";
import { Button } from "@/components/ui/button";
import type { Task, NewTaskInput } from "@/hooks/useTasks";
import { type Priority } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();
  const prefs = usePreferences();

  const signOut = async () => {
     await supabase.auth.signOut();
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<Priority | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
    }
  }, [user, authLoading, navigate]);

  const { tasks, loading: tasksLoading, addTask, updateTask, toggleTask, deleteTask } = useTasks(user?.id);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // Regra de auto-arquivamento visual temporária (UI side)
      if (t.completed && (prefs.completedRule === 'arquivar_7d' || prefs.completedRule === 'deletar_7d')) {
         const ruleThreshold = new Date();
         ruleThreshold.setDate(ruleThreshold.getDate() - 7);
         const dateToCheck = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
         if (dateToCheck < ruleThreshold) {
           return false;
         }
      }

      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      if (selectedTag && (!t.tags || !t.tags.includes(selectedTag))) {
        return false;
      }
      if (selectedPriority && t.priority !== selectedPriority) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, selectedTag, selectedPriority, prefs.completedRule]);


  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-content-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const cycleView = () => {
    const views = ['lista', 'kanban', 'calendario'] as const;
    const nextIndex = (views.indexOf(prefs.defaultView) + 1) % views.length;
    prefs.setPreferences({ defaultView: views[nextIndex] });
  };

  const ViewIcon = 
    prefs.defaultView === 'lista' ? LayoutList :
    prefs.defaultView === 'kanban' ? KanbanSquare : CalendarDays;

  return (
    <div className="min-h-screen bg-transparent pb-20 relative overflow-x-hidden">
      <Onboarding />
      <FocusMode 
        task={activeFocusTask} 
        onClose={() => setActiveFocusTask(null)} 
        onComplete={toggleTask} 
      />
      <Header email={user.email ?? ""} onSignOut={signOut} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10 transition-all duration-300">
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
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
            className="flex items-center gap-2"
          >
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 rounded-full border-white/10 bg-card/40 backdrop-blur-md shadow-lg hover:bg-card/60 transition-colors"
              onClick={cycleView}
              title={`Modo Atual: ${prefs.defaultView}`}
            >
              <ViewIcon className="h-5 w-5 opacity-80 text-primary" />
            </Button>
            <TaskForm onSave={(input) => addTask(input as NewTaskInput)} />
          </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <DashboardStats tasks={tasks} />
          
          <FilterBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            selectedPriority={selectedPriority}
            setSelectedPriority={setSelectedPriority}
            availableTags={availableTags}
          />
        </motion.div>

        <AnimatePresence mode="popLayout">
          {prefs.defaultView === 'lista' && (
            <motion.div key="lista" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <TaskList
                tasks={filteredTasks}
                loading={tasksLoading}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            </motion.div>
          )}

          {prefs.defaultView === 'kanban' && (
            <motion.div key="kanban" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <KanbanBoard
                tasks={filteredTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
              />
            </motion.div>
          )}

          {prefs.defaultView === 'calendario' && (
            <motion.div key="calendario" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <CalendarBoard
                tasks={filteredTasks}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onUpdate={updateTask}
                onFocus={setActiveFocusTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
