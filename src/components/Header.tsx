import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare } from "lucide-react";

interface HeaderProps {
  email: string;
  onSignOut: () => void;
}

export function Header({ email, onSignOut }: HeaderProps) {
  return (
    <div className="pt-4 px-4 sticky top-0 z-50">
      <header className="mx-auto max-w-2xl bg-card/40 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-card/50">
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/40 shadow-lg shadow-primary/20 grid place-content-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">Todo List</span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-muted-foreground truncate hidden sm:inline">
              {email}
            </span>
            <Button variant="ghost" size="sm" onClick={onSignOut} className="rounded-full hover:bg-white/10 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
