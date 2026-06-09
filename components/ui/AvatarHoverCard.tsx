"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Flag } from "@/components/ui/Flag";
import { getUserCard, type UserCard } from "@/actions/user-card";

/**
 * Avatar con panel flotante al pasar el mouse (o foco): muestra el avatar en
 * grande, los puntos, el puesto y el campeón elegido. Carga los datos de forma
 * perezosa la primera vez. `link` (default true) lo envuelve en un enlace al
 * perfil; usar `link={false}` cuando ya está dentro de otro enlace (ej. filas
 * de la tabla) para no anidar <a>.
 */
export function AvatarHoverCard({
  userId,
  name,
  avatarUrl,
  size = 28,
  link = true,
}: {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  size?: number;
  link?: boolean;
}) {
  const [card, setCard] = useState<UserCard | null>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
    if (!card) void getUserCard(userId).then(setCard);
  };
  const hide = () => setOpen(false);

  const avatar = <Avatar name={name} src={avatarUrl} size={size} />;

  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {link ? (
        <Link href={`/jugador/${userId}`} className="inline-flex">
          {avatar}
        </Link>
      ) : (
        avatar
      )}

      {open && (
        <span className="absolute bottom-full left-0 z-50 mb-2 block w-44 bg-scoreboard-black border-pixel-thick shadow-pixel-lg p-3">
          {card ? (
            <>
              <span className="flex items-center gap-2">
                <Avatar name={card.displayName} src={card.avatarUrl} size={48} />
                <span className="min-w-0">
                  <span className="block font-display text-[9px] text-line-white truncate">
                    {card.displayName}
                  </span>
                  <span className="block font-body text-[10px] text-grey-400">
                    Puesto #{card.rank}
                  </span>
                </span>
              </span>
              <span className="mt-2 flex items-center justify-between">
                <span className="font-display text-[7px] tracking-[1px] text-card-yellow">PUNTOS</span>
                <span className="font-mono text-xl text-goal-orange leading-none">{card.points}</span>
              </span>
              <span className="mt-2 flex items-center gap-1.5 border-t-[2px] border-scoreboard-slate pt-2 font-body text-xs text-line-white">
                🏆{" "}
                {card.champion ? (
                  <>
                    <Flag flag={card.champion.flag} size={16} />
                    <span className="truncate">{card.champion.name}</span>
                  </>
                ) : (
                  <span className="text-grey-500">Sin campeón elegido</span>
                )}
              </span>
            </>
          ) : (
            <span className="font-body text-xs text-grey-400">Cargando…</span>
          )}
        </span>
      )}
    </span>
  );
}
