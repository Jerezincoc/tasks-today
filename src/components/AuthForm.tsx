import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "A senha deve ter no mínimo 6 caracteres").max(72);
const firstNameSchema = z.string().trim().min(2, "O nome deve ter no mínimo 2 caracteres").max(50);
const lastNameSchema = z.string().trim().max(50).optional();

function translateError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (m.includes("email not confirmed")) return "Confirme seu email antes de entrar. Verifique sua caixa de entrada.";
  if (m.includes("user already registered")) return "Este email já está cadastrado. Faça login.";
  if (m.includes("password should be")) return "A senha é muito fraca. Use ao menos 6 caracteres.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde um momento.";
  return message;
}

export function AuthForm() {
  const { updateProfile } = useAuthStore();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const { error } = await supabase.auth.signInWithPassword({
        email: validEmail,
        password: validPassword,
      });
      if (error) {
        toast.error("Erro ao entrar", { description: translateError(error.message) });
      } else {
        toast.success("Bem-vindo de volta!");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("Dados inválidos", { description: err.issues[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const validFirstName = firstNameSchema.parse(firstName);
      const validLastName = lastNameSchema.parse(lastName) ?? "";
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: validEmail,
        password: validPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: { first_name: validFirstName, last_name: validLastName },
        },
      });
      if (error) {
        toast.error("Erro ao cadastrar", { description: translateError(error.message) });
      } else if (data.user && !data.session) {
        toast.success("Cadastro realizado!", {
          description: "Verifique seu email para confirmar a conta antes de entrar.",
        });
        setTab("login");
      } else {
        await updateProfile({ firstName: validFirstName, lastName: validLastName });
        toast.success("Conta criada com sucesso!");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error("Dados inválidos", { description: err.issues[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto relative z-10">
      <div className="text-center mb-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="h-16 w-16 bg-gradient-to-br from-primary to-primary/40 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
        >
          <Command className="h-8 w-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
          Todo List
        </h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground/80">
          Sua produtividade começa agora.
        </p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl shadow-black/50 p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <Tabs value={tab} onValueChange={setTab} className="relative z-10">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-background/50 p-1.5 rounded-2xl h-auto border border-white/5">
            <TabsTrigger value="login" className="rounded-xl py-2.5 font-semibold text-sm data-[state=active]:bg-card/80 data-[state=active]:shadow-sm transition-all">Entrar</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl py-2.5 font-semibold text-sm data-[state=active]:bg-card/80 data-[state=active]:shadow-sm transition-all">Criar Conta</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="login" className="mt-0 outline-none">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="font-medium text-foreground/80 pl-1">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pl-1">
                      <Label htmlFor="login-password" className="font-medium text-foreground/80">Senha</Label>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all mt-6" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Acessar Conta"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 outline-none">
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className="font-medium text-foreground/80 pl-1">Nome *</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="João"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoComplete="given-name"
                        className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname" className="font-medium text-foreground/80 pl-1">Sobrenome</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Silva"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="font-medium text-foreground/80 pl-1">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="font-medium text-foreground/80 pl-1">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo de 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="h-12 bg-background/50 border-white/10 rounded-xl focus-visible:ring-primary/50 transition-all px-4"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all mt-6" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Criar nova conta"}
                  </Button>
                  <p className="text-xs text-muted-foreground/60 text-center mt-4 font-medium px-4">
                    Um email de confirmação será enviado após o cadastro.
                  </p>
                </form>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
