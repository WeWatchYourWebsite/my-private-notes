import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { listUsers, deleteUser } from "@/lib/admin.functions";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Notely" }] }),
});

type Row = {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  roles: string[];
  note_count: number;
};

function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fetchUsers = useServerFn(listUsers);
  const removeUser = useServerFn(deleteUser);
  const [rows, setRows] = useState<Row[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate({ to: "/auth" });
    if (!isAdmin) return navigate({ to: "/dashboard" });
  }, [loading, user, isAdmin, navigate]);

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetchUsers();
      setRows(res.users);
      setTotalNotes(res.totalNotes);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const handleDelete = async (id: string) => {
    try {
      await removeUser({ data: { userId: id } });
      toast.success("Account deleted");
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading || !isAdmin) return null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Admin panel</h1>
          <p className="text-muted-foreground">Manage user accounts.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card><CardHeader><CardTitle>Total users</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{rows.length}</CardContent></Card>
          <Card><CardHeader><CardTitle>Total notes</CardTitle></CardHeader>
            <CardContent className="text-3xl font-semibold">{totalNotes}</CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Users</CardTitle></CardHeader>
          <CardContent>
            {busy ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.email}</TableCell>
                      <TableCell>{r.display_name ?? "—"}</TableCell>
                      <TableCell>
                        {r.roles.map((role) => (
                          <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="mr-1">
                            {role}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>{r.note_count}</TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={r.id === user?.id}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete account?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently deletes {r.email} and all of their notes. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(r.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Make an admin</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            New signups get the <code>user</code> role. To grant admin access, open the backend dashboard and add a row to <code>user_roles</code> with role = <code>admin</code> for the user.
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}