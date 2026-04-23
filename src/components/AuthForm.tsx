import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "A senha deve ter no mínimo 6 caracteres").max(72);

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
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const validEmail = emailSchema.parse(email);
      const validPassword = passwordSchema.parse(password);
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signUp({
        email: validEmail,
        password: validPassword,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) {
        toast.error("Erro ao cadastrar", { description: translateError(error.message) });
      } else if (data.user && !data.session) {
        toast.success("Cadastro realizado!", {
          description: "Verifique seu email para confirmar a conta antes de entrar.",
        });
        setTab("login");
      } else {
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
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Todo List</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Organize suas tarefas de forma simples
        </p>
      </div>
      <div className="bg-card border border-border rounded-xl shadow-sm p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Entrar"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Criar conta"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Você receberá um email para confirmar seu cadastro.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
