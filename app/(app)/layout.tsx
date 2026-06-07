import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";

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
    // En desktop el bloque (sidebar + panel) se centra y acota, en vez de
    // estirarse al 100% del ancho. El contenido (mobile-first) va en columna.
    <div className="mx-auto flex min-h-screen max-w-4xl">
      <Sidebar displayName={displayName} />
      <main className="flex-1 pb-20 md:pb-0 md:flex md:justify-center">
        <div className="w-full max-w-md bg-scoreboard-black md:min-h-screen md:border-x-[3px] md:border-border">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
