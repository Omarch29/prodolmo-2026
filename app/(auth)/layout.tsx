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
    <div className="ds-grass min-h-screen flex items-center justify-center p-4">{children}</div>
  );
}
