import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { usePreferences } from "@/hooks/usePreferences";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, User, Shield, Settings2, Lock, LogOut } from "lucide-react";

const settingsSearchSchema = z.object({
  tab: z.enum(["perfil", "seguranca", "preferencias"]).catch("preferencias"),
});

export const Route = createFileRoute("/settings")({
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, updateProfile } = useAuthStore();
  const navigate = useNavigate({ from: "/settings" });
  const { tab } = Route.useSearch();
  const signOut = () => supabase.auth.signOut();
  const { setPreferences, ...prefs } = usePreferences();

  // Perfil
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [nickname, setNickname] = useState(profile?.nickname ?? "");
  const [profileLoading, setProfileLoading] = useState(false);

  // Segurança
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secLoading, setSecLoading] = useState(false);
  const [globalSignOutLoading, setGlobalSignOutLoading] = useState(false);

  const handleSaveProfile = async () => {
    if (!firstName || firstName.trim().length < 2) {
      toast.error("Nome deve ter no mínimo 2 caracteres.");
      return;
    }
    setProfileLoading(true);
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim(), nickname: nickname.trim() });
      toast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao atualizar perfil: " + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }

    setSecLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPassword,
      });

      if (signInError) {
        toast.error("Senha atual incorreta.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Erro ao trocar senha: " + err.message);
    } finally {
      setSecLoading(false);
    }
  };

  const handleGlobalSignOut = async () => {
    setGlobalSignOutLoading(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Todas as sessões foram encerradas.");
    } catch (err: any) {
      toast.error("Erro ao encerrar sessões: " + err.message);
    } finally {
      setGlobalSignOutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 relative">
      <Header email={user?.email ?? ""} onSignOut={signOut} />

      <main className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">Configurações</h1>

        <Tabs
          value={tab}
          onValueChange={(v) => navigate({ search: { tab: v as "perfil" | "seguranca" | "preferencias" } })}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-card/40 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl h-auto">
            <TabsTrigger value="perfil" className="rounded-xl py-2.5 font-semibold text-sm gap-2 data-[state=active]:bg-card/80 data-[state=active]:shadow-sm transition-all">
              <User className="h-4 w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="rounded-xl py-2.5 font-semibold text-sm gap-2 data-[state=active]:bg-card/80 data-[state=active]:shadow-sm transition-all">
              <Shield className="h-4 w-4" /> Segurança
            </TabsTrigger>
            <TabsTrigger value="preferencias" className="rounded-xl py-2.5 font-semibold text-sm gap-2 data-[state=active]:bg-card/80 data-[state=active]:shadow-sm transition-all">
              <Settings2 className="h-4 w-4" /> Preferências
            </TabsTrigger>
          </TabsList>

          {/* ── ABA PERFIL ── */}
          <TabsContent value="perfil">
            <div className="space-y-6 bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl">
              <h2 className="text-xl font-bold tracking-tight">Perfil Público</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="s-firstname">Nome *</Label>
                  <Input
                    id="s-firstname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="João"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-lastname">Sobrenome</Label>
                  <Input
                    id="s-lastname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Silva"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="s-nickname">Apelido / Nickname</Label>
                <Input
                  id="s-nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Sudo"
                  className="bg-background/50 border-white/10 focus-visible:ring-primary"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={profileLoading} className="shadow-lg shadow-primary/25">
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar Perfil
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── ABA SEGURANÇA ── */}
          <TabsContent value="seguranca">
            <div className="space-y-6">

              {/* Troca de senha */}
              <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl space-y-5">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Trocar Senha
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="s-current-pw">Senha Atual *</Label>
                  <Input
                    id="s-current-pw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-new-pw">Nova Senha *</Label>
                  <Input
                    id="s-new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-confirm-pw">Confirmar Nova Senha *</Label>
                  <Input
                    id="s-confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    variant="destructive"
                    onClick={handleUpdatePassword}
                    disabled={secLoading || !currentPassword || !newPassword}
                    className="gap-2"
                  >
                    {secLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Trocar Senha
                  </Button>
                </div>
              </div>

              {/* Sessões ativas */}
              <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl space-y-4">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-destructive" /> Sessões Ativas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Encerra sua sessão em todos os dispositivos e navegadores simultaneamente.
                </p>
                <Button
                  variant="outline"
                  onClick={handleGlobalSignOut}
                  disabled={globalSignOutLoading}
                  className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                >
                  {globalSignOutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Encerrar todas as sessões
                </Button>
              </div>

            </div>
          </TabsContent>

          {/* ── ABA PREFERÊNCIAS ── */}
          <TabsContent value="preferencias">
            <div className="space-y-8 bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl">

              <section className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Aparência</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["claro", "escuro", "sistema"].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setPreferences({ theme: theme as any })}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                        prefs.theme === theme
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-background/50 hover:border-primary/50"
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-border/50">
                <h2 className="text-xl font-bold tracking-tight">Comportamento</h2>

                <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Uso de Prazos Obrigatório</Label>
                    <p className="text-sm text-muted-foreground">Exige data para salvar uma tarefa.</p>
                  </div>
                  <Switch
                    checked={prefs.useDeadlines}
                    onCheckedChange={(c) => setPreferences({ useDeadlines: c })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-background/30 rounded-xl border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold">Modo Avançado</Label>
                    <p className="text-sm text-muted-foreground">Habilita tags, recorrência e filtros refinados.</p>
                  </div>
                  <Switch
                    checked={prefs.complexity === "avancado"}
                    onCheckedChange={(c) => setPreferences({ complexity: c ? "avancado" : "simples" })}
                  />
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-border/50">
                <h2 className="text-xl font-bold tracking-tight">Histórico de Concluídas</h2>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setPreferences({ completedRule: "manter" })}
                    className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                      prefs.completedRule === "manter"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/50"
                    }`}
                  >
                    Sempre manter
                  </button>
                  <button
                    onClick={() => setPreferences({ completedRule: "arquivar_7d" })}
                    className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${
                      prefs.completedRule === "arquivar_7d"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 bg-background/50"
                    }`}
                  >
                    Auto-Arquivar após 7 dias
                  </button>
                </div>
              </section>

            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
