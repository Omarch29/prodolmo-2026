"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./items";
import { cn } from "@/lib/utils";

/** Navegación inferior — solo mobile. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 bg-scoreboard-black border-t-[4px] border-border">
      {NAV_ITEMS.map((it) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-col items-center gap-1 py-2 font-display text-[8px] tracking-[1.5px]",
              active ? "bg-pitch-green text-ink" : "text-grey-300",
            )}
          >
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
