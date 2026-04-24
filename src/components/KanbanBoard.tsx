import type { Task } from "@/hooks/useTasks";
import { TaskItem } from "./TaskItem";
import { motion } from "framer-motion";
import { LayoutList, Play, CheckCircle2 } from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
}

export function KanbanBoard({ tasks, onToggle, onDelete, onUpdate }: KanbanBoardProps) {
  const todo = tasks.filter(t => !t.completed && (t.status === 'pendente' || !t.status));
  const inProgress = tasks.filter(t => !t.completed && t.status === 'em_andamento');
  const done = tasks.filter(t => t.completed);

  const columns = [
    { title: "A Fazer", items: todo, icon: LayoutList, status: 'pendente' },
    { title: "Fazendo", items: inProgress, icon: Play, status: 'em_andamento' },
    { title: "Concluído", items: done, icon: CheckCircle2, status: 'concluido' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-8 w-full overflow-x-auto pb-8 snap-x">
       {columns.map((col, idx) => (
         <div key={idx} className="flex-1 min-w-[300px] bg-card/20 border border-white/5 backdrop-blur-sm rounded-3xl p-4 snap-start">
            <div className="flex items-center gap-3 mb-6 px-2">
               <div className="h-8 w-8 rounded-lg bg-background/50 flex items-center justify-center shadow-inner">
                 <col.icon className="h-4 w-4 opacity-70" />
               </div>
               <h3 className="font-bold text-lg">{col.title}</h3>
               <span className="ml-auto text-xs font-black bg-background/50 px-2 py-1 rounded-md opacity-70">{col.items.length}</span>
            </div>
            
            <div className="space-y-4">
              {col.items.length === 0 ? (
                 <div className="h-24 rounded-2xl border-2 border-dashed border-border/30 grid place-content-center">
                    <span className="text-sm font-semibold opacity-30">Vazio</span>
                 </div>
              ) : (
                col.items.map(task => (
                  <motion.div key={task.id} layout className="relative group/kanban">
                    <TaskItem 
                      task={task} 
                      onToggle={onToggle} 
                      onDelete={onDelete} 
                      onUpdate={onUpdate} 
                    />
                    {/* Botões de Ação Rápida Kanban */}
                    {!task.completed && (
                       <div className="absolute -bottom-3 right-4 opacity-0 group-hover/kanban:opacity-100 transition-all flex gap-1 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border p-1 z-10 scale-90">
                         {task.status !== 'em_andamento' && (
                           <button onClick={() => onUpdate(task.id, {status: 'em_andamento'})} className="text-[10px] font-bold px-3 py-1 hover:bg-primary/20 hover:text-primary rounded-full transition-colors flex items-center"><Play className="w-3 h-3 mr-1"/> Iniciar</button>
                         )}
                         {task.status === 'em_andamento' && (
                           <button onClick={() => onUpdate(task.id, {status: 'pendente'})} className="text-[10px] font-bold px-3 py-1 hover:bg-muted rounded-full transition-colors">Pausar</button>
                         )}
                       </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
         </div>
       ))}
    </div>
  );
}
