import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { NotebookPen } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Notely — Notes for individuals and teams" },
      { name: "description", content: "A simple, secure notes app. Sign up free to capture your ideas." },
    ],
  }),
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-semibold">
          <NotebookPen className="h-5 w-5 text-primary" />
          Notely
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
          <Button asChild><Link to="/auth">Get started</Link></Button>
        </div>
      </header>
      <main className="container flex flex-col items-center text-center pt-24 pb-32">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl">
          Your private space for ideas, notes, and thinking.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          Capture and organize your notes in one secure place. Only you can see what you write.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild size="lg"><Link to="/auth">Create free account</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/auth">Sign in</Link></Button>
        </div>
      </main>
    </div>
  );
}
