import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  authorId: string;
  author: string;
  avatarUrl: string | null;
};

/** Comentarios de un partido, del más viejo al más nuevo. */
export async function getComments(
  supabase: SupabaseClient<Database>,
  matchId: string,
): Promise<CommentItem[]> {
  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, profile:profiles(display_name, avatar_url)")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    authorId: c.user_id,
    author: c.profile?.display_name ?? "?",
    avatarUrl: c.profile?.avatar_url ?? null,
  }));
}
