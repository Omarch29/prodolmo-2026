"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="w-full max-w-sm bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-6">
      <h1 className="font-display text-line-white text-sm flex items-center gap-2 mb-1">
        <span>⚽</span> PRODE 2026
      </h1>
      <p className="font-body text-grey-300 text-sm mb-6">Ingresá para cargar tus pronósticos.</p>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-display text-[8px] tracking-[1.5px] text-pitch-green-lighter">EMAIL</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="bg-line-white text-ink border-pixel px-3 py-2 font-body text-sm outline-none focus:bg-card-yellow/30"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-display text-[8px] tracking-[1.5px] text-pitch-green-lighter">CONTRASEÑA</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="bg-line-white text-ink border-pixel px-3 py-2 font-body text-sm outline-none focus:bg-card-yellow/30"
          />
        </label>

        {state.error && (
          <p className="font-body text-sm text-card-red bg-scoreboard-slate border-pixel px-3 py-2">
            {state.error}
          </p>
        )}

        <Button type="submit" block disabled={pending}>
          {pending ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </div>
  );
}
