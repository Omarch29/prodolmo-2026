"use client";

import { useActionState } from "react";
import { addComment, type CommentState } from "@/actions/comments";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { CommentItem } from "@/lib/queries/comments";

const initialState: CommentState = { error: null };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export function MatchComments({ matchId, comments }: { matchId: string; comments: CommentItem[] }) {
  const [state, action, pending] = useActionState(addComment, initialState);

  return (
    <section className="mx-4 bg-scoreboard-black border-pixel-thick shadow-pixel-sm">
      <div className="font-display text-[9px] tracking-[1px] text-line-white px-3 py-2 border-b-[3px] border-border">
        💬 COMENTARIOS
      </div>

      <ul className="flex flex-col">
        {comments.length === 0 ? (
          <li className="px-3 py-3 font-body text-sm text-grey-400">Todavía no hay comentarios. ¡Rompé el hielo!</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="flex gap-2 px-3 py-2 border-b-[2px] border-scoreboard-slate last:border-b-0">
              <Avatar name={c.author} size={28} />
              <div className="min-w-0">
                <div className="font-body text-[11px] text-grey-400">
                  <span className="text-line-white font-semibold">{c.author}</span> · {fmt(c.createdAt)}
                </div>
                <p className="font-body text-sm text-line-white break-words">{c.body}</p>
              </div>
            </li>
          ))
        )}
      </ul>

      <form action={action} className="flex flex-col gap-2 p-3 border-t-[3px] border-border">
        <input type="hidden" name="matchId" value={matchId} />
        <textarea
          name="body"
          rows={2}
          maxLength={500}
          required
          placeholder="Escribí un comentario..."
          className="bg-line-white text-ink border-pixel px-2 py-2 font-body text-sm outline-none resize-none"
        />
        {state.error && <p className="font-body text-sm text-card-red">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending} className="self-end">
          {pending ? "Enviando..." : "Comentar"}
        </Button>
      </form>
    </section>
  );
}
