import { redirect } from "next/navigation";

// El middleware decide: si no hay sesión, /dashboard rebota a /login.
export default function Home() {
  redirect("/dashboard");
}
