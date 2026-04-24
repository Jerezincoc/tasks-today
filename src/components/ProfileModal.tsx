import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, Edit3 } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileModal() {
  const { profile, updateProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [nickname, setNickname] = useState(profile?.nickname || '');

  const handleSave = async () => {
    if (!firstName || !lastName) {
      toast.error('Nome e sobrenome são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ firstName, lastName, nickname });
      toast.success('Perfil atualizado magicamente no Cloud Backend! ✨');
      setIsOpen(false);
    } catch (err: any) {
      toast.error('Erro ao atualizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-foreground/80 hover:text-foreground">
           <Edit3 className="h-4 w-4" /> Editar Perfil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-2xl border-white/10 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">Personalize sua Conta</DialogTitle>
          <DialogDescription>
             Atualize seu nome para aparecer no topo do ecossistema. Todo dado será validado (Zod) lá nas nuvens (Node Proxy).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Nome *</Label>
                 <Input 
                   value={firstName} 
                   onChange={(e) => setFirstName(e.target.value)}
                   className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary"
                 />
              </div>
              <div className="space-y-2">
                 <Label>Sobrenome *</Label>
                 <Input 
                   value={lastName} 
                   onChange={(e) => setLastName(e.target.value)}
                   className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary"
                 />
              </div>
           </div>
           
           <div className="space-y-2">
               <Label>Apelido / Nickname</Label>
               <Input 
                 value={nickname} 
                 onChange={(e) => setNickname(e.target.value)}
                 placeholder="Sudo"
                 className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary"
               />
           </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="shadow-lg shadow-primary/25">
             {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <User className="h-4 w-4 mr-2" />}
             Salvar Cloud
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
