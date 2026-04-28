import React, { useState } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PasswordChangeOverlay() {
  const { mustChangePassword, setMustChangePassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Senhas não coincidem!');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // 1. Atualiza a senha no Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
      if (authError) throw authError;

      // 2. Chama a API do Proxy para resetar o "force_password_change"
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const token = freshSession?.access_token;

      const res = await fetch('/api/profiles/reset-force-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error ?? 'Falha ao resetar a trava de segurança no banco.');
      }

      toast.success('Senha atualizada com sucesso!');
      setMustChangePassword(false);
    } catch (err: any) {
      toast.error('Erro ao trocar a senha: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-content-center px-4 bg-background/80 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-md w-full bg-card/90 border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-destructive to-primary" />
          
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-16 w-16 bg-destructive/10 text-destructive rounded-full grid place-content-center mb-4">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Troca de Senha Obrigatória</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Para manter o ecossistema seguro, detectamos que você deve alterar sua senha no primeiro acesso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   type="password"
                   value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                   className="pl-10 bg-background/50 border-white/10"
                   placeholder="******"
                 />
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Confirmar Nova Senha</Label>
              <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <Input 
                   type="password"
                   value={confirmPassword}
                   onChange={e => setConfirmPassword(e.target.value)}
                   className="pl-10 bg-background/50 border-white/10"
                   placeholder="******"
                 />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 mt-6 shadow-xl" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Atualizar e Prosseguir"}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
