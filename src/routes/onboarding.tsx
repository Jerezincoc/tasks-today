import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Loader2, Sun, Moon, Contrast,
  KanbanSquare, CalendarDays, LayoutList,
  User, Briefcase, Lock, Clock, CalendarCheck2, Hourglass,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

const TOTAL_STEPS = 6;

function OptionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-1.5",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border/50 bg-background/50 hover:border-primary/50 text-foreground"
      )}
    >
      {children}
    </button>
  );
}

const themeOptions = [
  { value: "light", label: "Claro", icon: <Sun className="h-5 w-5" />, desc: "Interface clara e limpa" },
  { value: "dark", label: "Escuro", icon: <Moon className="h-5 w-5" />, desc: "Fácil para os olhos" },
  { value: "alto-contraste", label: "Alto Contraste", icon: <Contrast className="h-5 w-5" />, desc: "Máxima legibilidade" },
];

const viewModeOptions = [
  { value: "kanban", label: "Kanban", icon: <KanbanSquare className="h-5 w-5" />, desc: "Arraste entre colunas" },
  { value: "calendario", label: "Calendário", icon: <CalendarDays className="h-5 w-5" />, desc: "Visão por data" },
  { value: "lista", label: "Lista", icon: <LayoutList className="h-5 w-5" />, desc: "Visão em lista linear" },
];

const usageOptions = [
  { value: "personal", label: "Pessoal", icon: <User className="h-5 w-5" />, desc: "Tarefas do dia a dia" },
  { value: "business", label: "Trabalho", icon: <Briefcase className="h-5 w-5" />, desc: "Projetos e equipes" },
];

const retentionOptions = [
  { value: 7, label: "7 dias", icon: <Clock className="h-5 w-5" />, desc: "Limpeza rápida" },
  { value: 30, label: "30 dias", icon: <CalendarCheck2 className="h-5 w-5" />, desc: "Recomendado" },
  { value: 90, label: "90 dias", icon: <CalendarDays className="h-5 w-5" />, desc: "Histórico amplo" },
  { value: 0, label: "Sempre", icon: <Hourglass className="h-5 w-5" />, desc: "Nunca deletar" },
];

const stepTitles = [
  "Como devemos te chamar?",
  "Escolha seu tema",
  "Como você prefere ver suas tarefas?",
  "Como você vai usar o app?",
  "Por quanto tempo guardar tarefas concluídas?",
  "Defina uma senha",
];

function OnboardingPage() {
  const { profile, session } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [theme, setTheme] = useState("light");
  const [viewMode, setViewMode] = useState("kanban");
  const [usageType, setUsageType] = useState("personal");
  const [tasksRetentionDays, setTasksRetentionDays] = useState(30);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const forcePasswordChange = profile?.force_password_change === true;

  const saveAndFinish = async (withPassword: boolean) => {
    if (withPassword) {
      if (newPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }
    } else if (forcePasswordChange) {
      toast.error("Você deve definir uma nova senha para continuar.");
      return;
    }

    setSaving(true);
    try {
      if (withPassword && newPassword) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
      }

      const res = await fetch("/api/profiles/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim() || profile?.firstName || "",
          lastName: lastName.trim() || profile?.lastName || "",
          theme,
          viewMode,
          usageType,
          tasksRetentionDays,
          onboardingVersion: 1,
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar preferências.");

      toast.success("Tudo pronto! Bem-vindo(a)!");
      navigate({ to: "/" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Passo {step} de {TOTAL_STEPS}</span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl flex flex-col min-h-[380px]">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
            {stepTitles[step - 1]}
          </h2>

          <div className="flex-1">
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ob-first">Nome *</Label>
                  <Input
                    id="ob-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="João"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-last">Sobrenome</Label>
                  <Input
                    id="ob-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Silva"
                    className="bg-background/50 border-white/10 focus-visible:ring-primary"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {themeOptions.map((opt) => (
                  <OptionCard key={opt.value} selected={theme === opt.value} onClick={() => setTheme(opt.value)}>
                    <span>{opt.icon}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </OptionCard>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {viewModeOptions.map((opt) => (
                  <OptionCard key={opt.value} selected={viewMode === opt.value} onClick={() => setViewMode(opt.value)}>
                    <span>{opt.icon}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </OptionCard>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {usageOptions.map((opt) => (
                  <OptionCard key={opt.value} selected={usageType === opt.value} onClick={() => setUsageType(opt.value)}>
                    <span>{opt.icon}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </OptionCard>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-2 gap-3">
                {retentionOptions.map((opt) => (
                  <OptionCard key={opt.value} selected={tasksRetentionDays === opt.value} onClick={() => setTasksRetentionDays(opt.value)}>
                    <span>{opt.icon}</span>
                    <span className="font-semibold text-sm">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </OptionCard>
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                {forcePasswordChange && (
                  <p className="text-sm text-destructive font-medium">
                    Por segurança, você deve definir uma nova senha antes de continuar.
                  </p>
                )}
                {!forcePasswordChange && (
                  <p className="text-sm text-muted-foreground">
                    Opcional. Você pode definir uma senha agora ou pular esta etapa.
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="ob-pw">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ob-pw"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-white/10 focus-visible:ring-primary"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ob-confirm-pw">Confirmar Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ob-confirm-pw"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-white/10 focus-visible:ring-primary"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="border-white/10">
                Voltar
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              {step === TOTAL_STEPS && !forcePasswordChange && (
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => saveAndFinish(false)}
                  disabled={saving}
                >
                  Pular
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 && firstName.trim().length < 2}
                >
                  Próximo
                </Button>
              ) : (
                <Button onClick={() => saveAndFinish(!!newPassword)} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Concluir
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
