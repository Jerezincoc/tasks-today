import { Button } from "@/components/ui/button";
import { LogOut, CheckSquare } from "lucide-react";

interface HeaderProps {
  email: string;
  onSignOut: () => void;
}

export function Header({ email, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 grid place-content-center">
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Todo List</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm text-muted-foreground truncate hidden sm:inline">
            {email}
          </span>
          <Button variant="ghost" size="sm" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
