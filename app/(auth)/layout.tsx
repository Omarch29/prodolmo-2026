import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya está logueado, no mostrar el login.
  if (user) redirect("/dashboard");

  return (
    // Fondo: imagen centrada, lo más grande posible sin recortar (contain).
    // El fondo oscuro se funde con la viñeta de la imagen en celular y desktop.
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-scoreboard-ink bg-center bg-no-repeat bg-contain"
      style={{ backgroundImage: "url('/login-bg.png')" }}
    >
      {children}
    </div>
  );
}
