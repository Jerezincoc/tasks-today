import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferences } from "@/hooks/usePreferences";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = 3;

export function Onboarding() {
  const { onboardingCompleted, setPreferences, completeOnboarding, ...prefs } = usePreferences();
  const [step, setStep] = useState(1);

  if (onboardingCompleted) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-content-center bg-background/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-card border border-border/50 shadow-2xl rounded-[24px] overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary/20 grid place-content-center">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-semibold text-muted-foreground">
              Passo {step} de {STEPS}
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Configure seu Espaço</h2>
          <p className="text-muted-foreground mb-8">
            Vamos personalizar a ferramenta para se adequar exatamente à forma como você trabalha.
          </p>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Label className="text-base font-semibold">Como você usará as tarefas?</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['pessoal', 'trabalho', 'ambos'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setPreferences({ useCase: val as any })}
                      className={cn("p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all", prefs.useCase === val ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50 hover:border-primary/50" )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Prefere trabalhar com um Kanba ou Lista?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {['lista', 'kanban'].map((val) => (
                      <button
                        key={val}
                        onClick={() => setPreferences({ defaultView: val as any })}
                        className={cn("p-4 rounded-xl border-2 text-sm font-semibold capitalize transition-all", prefs.defaultView === val ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50 hover:border-primary/50" )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Complexidade dos Recursos</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPreferences({ complexity: 'simples' })} className={cn("p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left", prefs.complexity === 'simples' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" )}>Simples<span className="block text-xs opacity-70 font-normal mt-1">Oculta tags e controles avançados</span></button>
                    <button onClick={() => setPreferences({ complexity: 'avancado' })} className={cn("p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left", prefs.complexity === 'avancado' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" )}>Avançado<span className="block text-xs opacity-70 font-normal mt-1">Habilita recorrência, filtros finos</span></button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold">O que fazer com tarefas concluídas?</Label>
                  <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => setPreferences({ completedRule: 'manter' })} className={cn("p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left", prefs.completedRule === 'manter' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" )}>Manter no Histórico</button>
                    <button onClick={() => setPreferences({ completedRule: 'arquivar_7d' })} className={cn("p-4 rounded-xl border-2 text-sm font-semibold transition-all text-left", prefs.completedRule === 'arquivar_7d' ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background/50" )}>Auto-Arquivar após 7 dias</button>
                    <button onClick={() => setPreferences({ completedRule: 'deletar_7d' })} className={cn("p-4 rounded-xl border-2 text-sm font-semibold text-destructive transition-all text-left", prefs.completedRule === 'deletar_7d' ? "border-destructive bg-destructive/10 text-destructive" : "border-border/50 bg-background/50" )}>Deletar permanentemente após 7 dias</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => s - 1)}>Voltar</Button>
            {step < STEPS ? (
              <Button onClick={() => setStep(s => s + 1)}>
                Próximo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={completeOnboarding} className="bg-primary text-primary-foreground font-bold hover:scale-105 transition-transform">
                Começar <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  )
}
