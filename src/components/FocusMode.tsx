import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Target } from "lucide-react";
import type { Task } from "@/hooks/useTasks";
import { Button } from "@/components/ui/button";

interface FocusModeProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string, completed: boolean) => void;
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring" }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-8 right-8 rounded-full h-12 w-12 hover:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>

        <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="text-center group"
        >
           <div className="h-20 w-20 mx-auto rounded-3xl bg-primary/20 flex items-center justify-center mb-8 shadow-2xl shadow-primary/20">
             <Target className="h-10 w-10 text-primary" />
           </div>
           
           <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-tight mb-6">
              {task.title}
           </h2>
           
           {task.description && (
             <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto font-medium">
                {task.description}
             </p>
           )}
           
           <div className="mt-16 flex items-center justify-center gap-6">
              <Button 
                onClick={() => {
                  onComplete(task.id, true);
                  setTimeout(onClose, 600);
                }}
                className="h-16 px-10 text-xl font-bold rounded-full shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
              >
                <Check className="h-6 w-6 mr-3" /> Concluir e Voltar
              </Button>
           </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
