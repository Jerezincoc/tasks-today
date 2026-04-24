import { useState } from "react";
import type { Task } from "@/hooks/useTasks";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { TaskItem } from "./TaskItem";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarBoardProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onFocus?: (task: Task) => void;
}

export function CalendarBoard({ tasks, onToggle, onDelete, onUpdate, onFocus }: CalendarBoardProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const dayTasks = tasks.filter(t => t.due_date && date && isSameDay(new Date(t.due_date), date));

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-8 w-full items-start">
       <div className="w-full md:w-auto shrink-0 bg-card/40 backdrop-blur-md rounded-3xl border border-white/5 p-4 shadow-xl">
          <Calendar
             mode="single"
             selected={date}
             onSelect={setDate}
             locale={ptBR}
             className="pointer-events-auto"
          />
       </div>
       <div className="flex-1 w-full space-y-4">
          <h3 className="text-xl font-bold mb-6">
             Tarefas de {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : ""}
          </h3>
          {dayTasks.length === 0 ? (
             <div className="h-32 rounded-3xl border-2 border-dashed border-border/30 grid place-content-center text-center px-4">
                <span className="text-sm font-semibold opacity-50">Seu dia está livre de tarefas agendadas.</span>
             </div>
          ) : (
             <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {dayTasks.map(task => (
                    <TaskItem 
                      key={task.id}
                      task={task} 
                      onToggle={onToggle} 
                      onDelete={onDelete} 
                      onUpdate={onUpdate}
                      onFocus={onFocus}
                    />
                  ))}
                </AnimatePresence>
             </motion.div>
          )}
       </div>
    </div>
  );
}
