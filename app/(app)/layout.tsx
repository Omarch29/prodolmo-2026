import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { AppFx } from "@/components/fx/AppFx";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defensa además del middleware.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? "Jugador";

  return (
    // En desktop: sidebar fijo + área de contenido ancha (el bloque se acota y
    // centra en pantallas muy grandes). Cada pantalla maneja su propio layout.
    <div className="mx-auto flex min-h-screen w-full max-w-6xl">
      <AppFx />
      <Sidebar displayName={displayName} />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
