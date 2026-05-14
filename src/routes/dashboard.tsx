import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

type Note = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
};

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Your notes — Notely" }] }),
});

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const load = async () => {
    setLoadingNotes(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, title, content, updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setNotes(data ?? []);
    setLoadingNotes(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase
      .from("notes")
      .insert({ title, content, user_id: user.id });
    if (error) return toast.error(error.message);
    setTitle(""); setContent("");
    toast.success("Note created");
    load();
  };

  const update = async (n: Note) => {
    const { error } = await supabase
      .from("notes")
      .update({ title: n.title, content: n.content })
      .eq("id", n.id);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setNotes((ns) => ns.filter((n) => n.id !== id));
  };

  if (loading || !user) return null;

  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader><CardTitle>New note</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={create} className="space-y-3">
              <Input placeholder="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Write something..." rows={5} value={content} onChange={(e) => setContent(e.target.value)} />
              <Button type="submit" className="w-full"><Plus className="h-4 w-4 mr-1" />Add note</Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Your notes</h2>
          {loadingNotes ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet. Create your first one.</p>
          ) : notes.map((n) => (
            <Card key={n.id}>
              <CardContent className="pt-6 space-y-3">
                <Input
                  value={n.title}
                  onChange={(e) => setNotes((ns) => ns.map((x) => x.id === n.id ? { ...x, title: e.target.value } : x))}
                />
                <Textarea
                  rows={4}
                  value={n.content}
                  onChange={(e) => setNotes((ns) => ns.map((x) => x.id === n.id ? { ...x, content: e.target.value } : x))}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Updated {new Date(n.updated_at).toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => update(n)}>
                      <Save className="h-4 w-4 mr-1" />Save
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(n.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}