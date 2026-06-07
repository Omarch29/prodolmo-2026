"use client";

import { usePathname } from "next/navigation";
import { Confetti } from "./Confetti";
import { useConfetti } from "./useConfetti";

/**
 * Efectos al entrar a la app: dispara los papelitos al loguearse y en cada
 * cambio de pantalla (la `key` por pathname remonta el confetti y lo re-reproduce).
 * Se puede desactivar con el toggle del sidebar.
 */
export function AppFx() {
  const pathname = usePathname();
  const on = useConfetti();
  if (!on) return null;
  return <Confetti key={pathname} />;
}
