import { useEffect } from "react";
import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { usePreferences } from "@/hooks/usePreferences";
import { useAuthStore } from "@/hooks/useAuthStore";

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
  // Let ThemeSync execute on client safely
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

import { PasswordChangeOverlay } from "@/components/PasswordChangeOverlay";

function RootComponent() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <>
      <ThemeSync />
      <PasswordChangeOverlay />
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}
