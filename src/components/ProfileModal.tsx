import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, Edit3, Lock, Shield } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileModal() {
  const { profile, updateProfile } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Data
  const [firstName, setFirstName] = useState(profile?.firstName || '');
  const [lastName, setLastName] = useState(profile?.lastName || '');
  const [nickname, setNickname] = useState(profile?.nickname || '');

  // Security Data
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secLoading, setSecLoading] = useState(false);

  const handleSaveProfile = async () => {
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

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
       toast.error("A nova senha e confirmação não coincidem.");
       return;
    }
    if (newPassword.length < 6) {
       toast.error("A senha deve ter pelo menos 6 caracteres.");
       return;
    }

    setSecLoading(true);
    try {
      // Supabase Auth requires user to be logged in, password update does not strictly require old password 
      // unless configuring "secure password change" which asks for it during sign in. 
      // We will perform the explicit update.
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // We do NOT close the modal to allow profile save if they want to.
    } catch (e: any) {
      toast.error("Erro Segurança: " + e.message);
    } finally {
      setSecLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-foreground/80 hover:text-foreground">
           <Edit3 className="h-4 w-4" /> Perfil & Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-2xl border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">Sua Conta</DialogTitle>
          <DialogDescription>
             Atualize seu nome ou reforce a sua senha no cofre.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
           {/* Profile Section */}
           <div className="border border-white/5 bg-background/30 rounded-xl p-4 space-y-4">
               <h3 className="text-sm font-bold flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Perfil Público</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label>Nome *</Label>
                     <Input 
                       value={firstName} 
                       onChange={(e) => setFirstName(e.target.value)}
                       className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary h-9"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label>Sobrenome *</Label>
                     <Input 
                       value={lastName} 
                       onChange={(e) => setLastName(e.target.value)}
                       className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary h-9"
                     />
                  </div>
               </div>
               
               <div className="space-y-2">
                   <Label>Apelido / Nickname</Label>
                   <Input 
                     value={nickname} 
                     onChange={(e) => setNickname(e.target.value)}
                     placeholder="Sudo"
                     className="bg-background/50 backdrop-blur-md border-white/10 focus-visible:ring-primary h-9"
                   />
               </div>

               <div className="flex justify-end mt-2">
                 <Button onClick={handleSaveProfile} disabled={loading} size="sm" className="shadow-lg shadow-primary/25">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Salvar Perfil Cloud"}
                 </Button>
               </div>
           </div>

           {/* Security Section */}
           <div className="border border-white/5 bg-background/30 rounded-xl p-4 space-y-4">
               <h3 className="text-sm font-bold flex items-center gap-2 text-destructive"><Shield className="h-4 w-4" /> Segurança</h3>
               <div className="space-y-3">
                  <div className="space-y-1.5">
                     <Label className="text-xs">Senha Atual</Label>
                     <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="• • • • • •" className="bg-background/50 border-white/10 h-9" />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-xs">Nova Senha</Label>
                     <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 6 chars" className="bg-background/50 border-white/10 h-9" />
                  </div>
                  <div className="space-y-1.5">
                     <Label className="text-xs">Confirmar Nova Senha</Label>
                     <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="• • • • • •" className="bg-background/50 border-white/10 h-9" />
                  </div>
               </div>
               <div className="flex justify-end mt-2">
                 <Button variant="destructive" size="sm" onClick={handleUpdatePassword} disabled={secLoading || (!newPassword && !currentPassword)}>
                    {secLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />} Trocar Senha
                 </Button>
               </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
