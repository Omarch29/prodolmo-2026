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
    <div className="flex min-h-screen">
      <Sidebar displayName={displayName} />
      {/* En desktop el contenido (diseñado mobile-first) se encolumna y enmarca
          como panel, en vez de estirarse al 100% del ancho. */}
      <main className="flex-1 pb-20 md:pb-0 md:flex md:justify-center">
        <div className="w-full max-w-md md:min-h-screen md:border-x-[3px] md:border-border">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
