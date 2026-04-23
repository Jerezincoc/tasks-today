import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Todo List" },
      { name: "description", content: "Entre ou cadastre-se para acessar sua lista de tarefas." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-content-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <AuthForm />
    </div>
  );
}
