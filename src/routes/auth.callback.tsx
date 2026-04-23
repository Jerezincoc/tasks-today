import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate({ to: "/" });
      } else {
        navigate({ to: "/auth" });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid place-content-center bg-background">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
        <p className="mt-3 text-sm text-muted-foreground">Confirmando seu acesso…</p>
      </div>
    </div>
  );
}
