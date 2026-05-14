import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NotebookPen, Shield, LogOut } from "lucide-react";
import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <NotebookPen className="h-5 w-5 text-primary" /> Notely
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Notes</Link></Button>
            {isAdmin && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin"><Shield className="mr-1 h-4 w-4" />Admin</Link>
              </Button>
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </header>
      <main className="container py-8">{children}</main>
    </div>
  );
}