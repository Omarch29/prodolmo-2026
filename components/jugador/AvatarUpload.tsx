"use client";

import { useActionState } from "react";
import { updateAvatar, type AvatarState } from "@/actions/profile";

const initialState: AvatarState = { error: null };

/** Subida del avatar propio (form -> Server Action que sube a Storage). */
export function AvatarUpload() {
  const [state, action, pending] = useActionState(updateAvatar, initialState);

  return (
    <form action={action} className="px-4 -mt-2 mb-2 flex flex-col gap-1">
      <label className="flex items-center gap-2 cursor-pointer">
        <span className="font-display text-[8px] tracking-[1px] border-pixel px-2 py-1.5 bg-scoreboard-slate text-line-white">
          📷 CAMBIAR FOTO
        </span>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
          className="font-body text-xs text-grey-400 file:hidden max-w-[140px]"
        />
        {pending && <span className="font-body text-xs text-grey-400">subiendo…</span>}
      </label>
      {state.error && <p className="font-body text-xs text-card-red">{state.error}</p>}
    </form>
  );
}
