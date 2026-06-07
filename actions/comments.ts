"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validation/comment";

export type CommentState = { error: string | null };

/** Crea un comentario en un partido. */
export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const parsed = commentSchema.safeParse({
    matchId: formData.get("matchId"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Comentario inválido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const { error } = await supabase.from("comments").insert({
    user_id: user.id,
    match_id: parsed.data.matchId,
    body: parsed.data.body,
  });
  if (error) return { error: "No se pudo publicar el comentario." };

  revalidatePath(`/cargar/${parsed.data.matchId}`);
  return { error: null };
}
