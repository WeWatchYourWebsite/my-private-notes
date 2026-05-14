import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { count: notesCountAll } = await supabaseAdmin
      .from("notes")
      .select("id", { count: "exact", head: true });

    const noteCounts: Record<string, number> = {};
    const { data: noteRows } = await supabaseAdmin.from("notes").select("user_id");
    for (const r of noteRows ?? []) {
      noteCounts[r.user_id] = (noteCounts[r.user_id] ?? 0) + 1;
    }

    const users = (profiles ?? []).map((p) => ({
      id: p.id,
      email: p.email,
      display_name: p.display_name,
      created_at: p.created_at,
      roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role),
      note_count: noteCounts[p.id] ?? 0,
    }));

    return { users, totalNotes: notesCountAll ?? 0 };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.userId === context.userId) throw new Error("You cannot delete your own account.");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });