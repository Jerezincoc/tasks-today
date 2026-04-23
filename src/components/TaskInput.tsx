import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const titleSchema = z.string().trim().min(1, "Digite o título da tarefa").max(500, "Máximo de 500 caracteres");

interface TaskInputProps {
  onAdd: (title: string) => Promise<void>;
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const valid = titleSchema.parse(title);
      setSubmitting(true);
      await onAdd(valid);
      setTitle("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="O que precisa ser feito?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
        maxLength={500}
        className="h-11"
      />
      <Button type="submit" disabled={submitting || !title.trim()} className="h-11 px-4">
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Adicionar</span>
      </Button>
    </form>
  );
}
