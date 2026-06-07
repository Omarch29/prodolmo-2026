import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  author: string;
};

/** Comentarios de un partido, del más viejo al más nuevo. */
export async function getComments(
  supabase: SupabaseClient<Database>,
  matchId: string,
): Promise<CommentItem[]> {
  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, profile:profiles(display_name)")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    author: c.profile?.display_name ?? "?",
  }));
}
