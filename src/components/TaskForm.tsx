import { useState, useEffect } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Loader2, Repeat, Tag as TagIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PRIORITY_LABELS, type Priority } from "@/lib/tasks";
import type { NewTaskInput, Task } from "@/hooks/useTasks";
import { parseQuickAdd } from "@/lib/nlp";

const schema = z.object({
  title: z.string().trim().min(1, "Digite o título").max(500, "Máximo de 500 caracteres"),
  description: z.string().trim().max(2000, "Máximo de 2000 caracteres").optional(),
});

interface TaskFormProps {
  onSave: (input: NewTaskInput | Partial<Task>) => Promise<void>;
  initialData?: Task;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskForm({ onSave, initialData, trigger, isOpen, onOpenChange }: TaskFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("08:00");
  const [priority, setPriority] = useState<Priority>("media");
  const [recurrence, setRecurrence] = useState("none");
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setPriority(initialData.priority);
        setRecurrence(initialData.recurrence || "none");
        setTags(initialData.tags || []);
        if (initialData.due_date) {
          const d = new Date(initialData.due_date);
          setDate(d);
          setTime(format(d, "HH:mm"));
        } else {
          setDate(undefined);
          setTime("08:00");
        }
      } else {
        reset();
      }
    }
  }, [open, initialData]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setDate(undefined);
    setTime("08:00");
    setPriority("media");
    setRecurrence("none");
    setTags([]);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    
    // Quick Add logic (NLP) only when creating new task
    if (!initialData && val.endsWith(" ")) {
      const parsed = parseQuickAdd(val);
      if (parsed.priority !== undefined) setPriority(parsed.priority);
      if (parsed.due_date !== undefined) setDate(parsed.due_date);
      if (parsed.tags && parsed.tags.length > 0) {
        setTags(prev => Array.from(new Set([...prev, ...parsed.tags!])));
      }
      if (parsed.title !== title) {
         setTitle(parsed.title);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = schema.parse({ title, description: description || undefined });

      let dueIso: string | null = null;
      if (date) {
        const [hh, mm] = (time || "08:00").split(":").map((v) => parseInt(v, 10));
        const due = new Date(date);
        due.setHours(isNaN(hh) ? 8 : hh, isNaN(mm) ? 0 : mm, 0, 0);
        dueIso = due.toISOString();
      }

      setSubmitting(true);
      await onSave({
        title: parsed.title,
        description: parsed.description ?? null,
        due_date: dueIso,
        priority,
        recurrence,
        tags
      });
      if (!initialData) reset();
      setOpen(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="h-12 px-6 rounded-full shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full sm:w-auto font-semibold group">
            <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Nova Tarefa
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md rounded-[24px] border-white/10 bg-card/80 backdrop-blur-3xl shadow-2xl overflow-hidden p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="p-6 relative z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {initialData ? "Editar Tarefa" : "Criar Nova Tarefa"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80 font-medium">
              Defina os detalhes, prazo e prioridade da sua tarefa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold text-foreground/90">Título</Label>
              <Input
                id="title"
                placeholder={!initialData ? "Ex: Ir ao médico amanhã prioridade alta #saúde" : "Título..."}
                value={title}
                onChange={handleTitleChange}
                maxLength={500}
                autoFocus
                className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl"
              />
              {tags.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                   {tags.map(tag => (
                     <span key={tag} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md font-bold flex items-center">
                       <TagIcon className="h-3 w-3 mr-1" /> {tag}
                     </span>
                   ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-semibold text-foreground/90">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Detalhes adicionais, links importantes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={2}
                className="resize-none bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground/90">Prazo</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full h-11 justify-start text-left font-medium bg-background/50 border-white/10 hover:bg-background/80 transition-all rounded-xl",
                        !date && "text-muted-foreground/70",
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2 opacity-70" />
                      {date ? format(date, "dd/MMM", { locale: ptBR }) : "Sem prazo"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-white/10 bg-card/90 backdrop-blur-2xl shadow-xl overflow-hidden" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={ptBR}
                      className={cn("p-3 pointer-events-auto")}
                    />
                    {date && (
                      <div className="p-2 border-t border-white/10 bg-muted/20">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors font-medium"
                          onClick={() => setDate(undefined)}
                        >
                          Remover prazo
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="font-semibold text-foreground/90">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!date}
                  className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl disabled:opacity-30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold text-foreground/90">Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl data-[state=open]:ring-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-card/90 backdrop-blur-xl shadow-xl">
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                      <SelectItem key={p} value={p} className="rounded-lg my-0.5 font-medium cursor-pointer">
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-foreground/90 flex items-center"><Repeat className="w-3 h-3 mr-1" /> Repetir</Label>
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="h-11 bg-background/50 border-white/10 focus-visible:ring-primary/50 transition-all rounded-xl data-[state=open]:ring-primary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-card/90 backdrop-blur-xl shadow-xl">
                    <SelectItem value="none" className="rounded-lg my-0.5 font-medium cursor-pointer">Não repete</SelectItem>
                    <SelectItem value="daily" className="rounded-lg my-0.5 font-medium cursor-pointer">Diariamente</SelectItem>
                    <SelectItem value="weekly" className="rounded-lg my-0.5 font-medium cursor-pointer">Semanalmente</SelectItem>
                    <SelectItem value="monthly" className="rounded-lg my-0.5 font-medium cursor-pointer">Mensalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-3 sm:gap-2 mt-8 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="rounded-full hover:bg-white/5 font-semibold transition-all"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={submitting || !title.trim()}
                className="rounded-full px-8 font-semibold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {initialData ? "Salvar" : "Criar Tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
