import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, signOut } = useAuth();
  const { setPreferences, ...prefs } = usePreferences();

  return (
    <div className="min-h-screen bg-transparent pb-20 relative">
      <Header email={user?.email ?? ""} onSignOut={signOut} />
      
      <main className="max-w-2xl mx-auto px-4 py-10 relative z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-6">Configurações</h1>
        
        <div className="space-y-8 bg-card/40 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl">
          
          {/* Seção Temas */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Aparência</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['claro', 'escuro', 'sistema'].map((theme) => (
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

          {/* Seção Comportamento */}
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
                checked={prefs.complexity === 'avancado'} 
                onCheckedChange={(c) => setPreferences({ complexity: c ? 'avancado' : 'simples' })} 
              />
            </div>
          </section>

          {/* Manutenção de Histórico */}
          <section className="space-y-4 pt-4 border-t border-border/50">
            <h2 className="text-xl font-bold tracking-tight">Histórico de Concluídas</h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => setPreferences({ completedRule: 'manter' })} 
                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${prefs.completedRule === 'manter' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" }`}
              >
                Sempre manter
              </button>
              <button 
                onClick={() => setPreferences({ completedRule: 'arquivar_7d' })} 
                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left ${prefs.completedRule === 'arquivar_7d' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" }`}
              >
                Auto-Arquivar após 7 dias
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
