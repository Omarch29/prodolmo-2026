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
    // Fondo: imagen (festejo) corrida un poco a la izquierda y abajo para que
    // no quede tapada por el login, sobre las barras verdes de cancha.
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "var(--color-pitch-green-dark)",
        backgroundImage:
          "url('/login-bg.png'), repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 48px, rgba(255,255,255,0.05) 48px 96px)",
        backgroundRepeat: "no-repeat, repeat",
        backgroundSize: "contain, auto",
        backgroundPosition: "22% 82%, center",
      }}
    >
      {children}
    </div>
  );
}
