"use client";

import { useRouter } from "next/navigation";

/**
 * Vuelve a la pantalla anterior con router.back(): así el listado de Cargar
 * conserva el tab/sección/día en el que estabas (guardados en la URL), en vez
 * de volver al inicio. Si no hay historial previo, cae al listado.
 */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="font-display text-line-white text-xs"
      aria-label="Volver"
    >
      ◂
    </button>
  );
}
