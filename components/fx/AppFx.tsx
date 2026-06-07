"use client";

import { usePathname } from "next/navigation";
import { Confetti } from "./Confetti";

/**
 * Efectos al entrar a la app: dispara los papelitos al loguearse y en cada
 * cambio de pantalla (la `key` por pathname remonta el confetti y lo re-reproduce).
 */
export function AppFx() {
  const pathname = usePathname();
  return <Confetti key={pathname} />;
}
