"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AvatarState = { error: string | null };

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/** Sube el avatar del usuario a Storage y actualiza profiles.avatar_url. */
export async function updateAvatar(_prev: AvatarState, formData: FormData): Promise<AvatarState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Elegí una imagen." };
  if (!file.type.startsWith("image/")) return { error: "Tiene que ser una imagen." };
  if (file.size > MAX_BYTES) return { error: "La imagen supera los 2 MB." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada." };

  const path = `${user.id}/avatar`;
  const upload = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (upload.error) return { error: "No se pudo subir la imagen." };

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = `${pub.publicUrl}?v=${Date.now()}`; // cache-busting al reemplazar

  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar el avatar." };

  revalidatePath("/", "layout");
  return { error: null };
}
