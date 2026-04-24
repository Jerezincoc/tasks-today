import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare, Settings2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProfileModal } from "./ProfileModal";
import { useAuthStore } from "@/hooks/useAuthStore";

interface HeaderProps {
  email: string;
  onSignOut: () => void;
}

export function Header({ email, onSignOut }: HeaderProps) {
  const { profile } = useAuthStore();
  const displayName = profile?.nickname || profile?.firstName || email;

  return (
    <div className="pt-4 px-4 sticky top-0 z-50">
      <header className="mx-auto max-w-4xl bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-card/70">
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/40 shadow-lg shadow-primary/20 grid place-content-center">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight hidden sm:block">Tasks Today</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-sm font-semibold text-muted-foreground truncate hidden md:inline max-w-[200px]">
              E aí, <span className="text-foreground">{displayName}</span>!
            </span>
            <ProfileModal />
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-white transition-colors">
                <Settings2 className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={onSignOut} className="rounded-full hover:bg-white/10 hover:text-white transition-colors px-3">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
