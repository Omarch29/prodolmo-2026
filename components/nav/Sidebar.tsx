"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./items";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

/** Navegación lateral — solo desktop. */
export function Sidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 md:sticky md:top-0 h-screen gap-6 p-4 bg-scoreboard-black border-r-[4px] border-border">
      <div className="font-display text-line-white text-sm flex items-center gap-2">
        <span>⚽</span> PRODOLMO
      </div>

      <nav className="flex flex-col gap-2">
        {NAV_ITEMS.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 font-display text-[10px] tracking-[1.5px] border-pixel",
                active
                  ? "bg-pitch-green text-ink shadow-pixel-xs"
                  : "bg-scoreboard-slate text-grey-300 hover:text-line-white",
              )}
            >
              <span className="text-base">{it.icon}</span> {it.label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="mt-auto">
        <div className="font-body text-xs text-grey-300 mb-2 truncate">{displayName}</div>
        <Button type="submit" variant="ghost" size="sm" block>
          Salir
        </Button>
      </form>
    </aside>
  );
}
