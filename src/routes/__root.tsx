import { useEffect, useState } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts, useNavigate, useRouterState } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { usePreferences } from "@/hooks/usePreferences";
import { useAuthStore } from "@/hooks/useAuthStore";

const NEW_URL = "https://tasks-today-sable.vercel.app";
const BANNER_KEY = "banner_migrado_fechado";

function WrongDomain() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", background: "#f9fafb" }}>
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>Mudamos de endereço!</h1>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>Acesse pelo novo link para continuar usando o Tasks Today.</p>
        <a
          href={NEW_URL}
          style={{ display: "inline-block", background: "#2563eb", color: "#fff", padding: "0.625rem 1.25rem", borderRadius: "0.375rem", textDecoration: "none", fontWeight: 500 }}
        >
          Ir para o novo endereço
        </a>
      </div>
    </div>
  );
}

function MigrationBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(BANNER_KEY));

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#dbeafe", borderBottom: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
      <span>
        Temos um endereço novo! Salva nos favoritos:{" "}
        <a href={NEW_URL} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "#1d4ed8", textDecoration: "underline" }}>
          tasks-today-sable.vercel.app
        </a>
      </span>
      <button
        onClick={() => { localStorage.setItem(BANNER_KEY, "true"); setVisible(false); }}
        style={{ marginLeft: "0.75rem", background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem", lineHeight: 1, color: "#374151" }}
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
}

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "To do List — Organize suas tarefas" },
      { name: "description", content: "Aplicativo de lista de tarefas com autenticação." },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function ThemeSync() {
  const { theme } = usePreferences();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "alto-contraste");

    if (theme === "sistema") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    if (theme === "escuro") {
       root.classList.add("dark");
    } else if (theme === "alto-contraste") {
       root.classList.add("alto-contraste");
    } else {
       root.classList.add("light");
    }
  }, [theme]);

  // Handle system theme changes
  useEffect(() => {
     if (usePreferences.getState().theme !== "sistema") return;

     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
     const handleChange = (e: MediaQueryListEvent) => {
        const root = window.document.documentElement;
        if (usePreferences.getState().theme === "sistema") {
           root.classList.remove("light", "dark");
           root.classList.add(e.matches ? "dark" : "light");
        }
     };
     mediaQuery.addEventListener("change", handleChange);
     return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return null;
}

function RootShell({ children }: { children: React.ReactNode }) {
  const isLovable = typeof window !== "undefined" && window.location.hostname.includes("lovable.app");

  if (isLovable) {
    return (
      <html lang="pt-BR">
        <head><HeadContent /></head>
        <body><WrongDomain /><Scripts /></body>
      </html>
    );
  }

  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { initializeAuth, loading, user, profile, mustChangePassword } = useAuthStore();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (
      !loading &&
      user &&
      profile !== null &&
      (profile.onboardingVersion === 0 || mustChangePassword) &&
      location.pathname !== "/onboarding"
    ) {
      navigate({ to: "/onboarding" });
    }
  }, [loading, user, profile, mustChangePassword, location.pathname]);

  return (
    <>
      <MigrationBanner />
      <ThemeSync />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
