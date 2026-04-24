import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Task } from "@/hooks/useTasks";
import { getTaskStatus } from "@/lib/tasks";

interface DashboardStatsProps {
  tasks: Task[];
}

export function DashboardStats({ tasks }: DashboardStatsProps) {
  const pending = tasks.filter(t => !t.completed && !t.archived);
  const completed = tasks.filter(t => t.completed && !t.archived);
  
  const total = pending.length + completed.length;
  const progress = total === 0 ? 0 : Math.round((completed.length / total) * 100);

  const now = new Date();
  const overdueObj = pending.filter(t => getTaskStatus(t, now) === "overdue");

  const data = [
    { name: "Concluídas", value: completed.length, color: "hsl(var(--primary))" },
    { name: "Pendentes", value: pending.length - overdueObj.length, color: "hsl(var(--muted-foreground))" },
    { name: "Atrasadas", value: overdueObj.length, color: "hsl(var(--destructive))" },
  ];

  return (
    <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-6 mb-8 mt-4 transition-all hover:bg-card/50">
      <div className="relative w-28 h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={50}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.value === 0 ? 0 : 1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-content-center">
           <span className="text-xl font-extrabold">{progress}%</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-4 w-full">
         <div>
            <h3 className="text-lg font-bold tracking-tight">Progresso Geral</h3>
            <p className="text-sm text-muted-foreground font-medium">Você concluiu {completed.length} de {total} tarefas.</p>
         </div>
         <div className="flex flex-wrap gap-3">
             <div className="bg-background/50 px-3 py-2 rounded-xl border border-white/5 shadow-inner flex-1 min-w-[100px]">
                <div className="text-2xl font-black text-primary">{completed.length}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Feitas</div>
             </div>
             <div className="bg-background/50 px-3 py-2 rounded-xl border border-white/5 shadow-inner flex-1 min-w-[100px]">
                <div className="text-2xl font-black">{pending.length}</div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Restantes</div>
             </div>
             {overdueObj.length > 0 && (
               <div className="bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20 shadow-inner flex-1 min-w-[100px]">
                  <div className="text-2xl font-black text-destructive">{overdueObj.length}</div>
                  <div className="text-xs font-semibold text-destructive/80 uppercase tracking-wider">Atrasadas</div>
               </div>
             )}
         </div>
      </div>
    </div>
  );
}
