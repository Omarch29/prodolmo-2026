import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Convención de Next 16 (reemplaza a middleware.ts).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto:
     * - _next/static, _next/image (assets)
     * - favicon, archivos de imagen
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
