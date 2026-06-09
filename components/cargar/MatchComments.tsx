"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { addComment, type CommentState } from "@/actions/comments";
import { AvatarHoverCard } from "@/components/ui/AvatarHoverCard";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
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
  const [html, setHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0); // para resetear el editor al publicar
  const [state, action, pending] = useActionState(
    async (prev: CommentState, formData: FormData) => {
      const result = await addComment(prev, formData);
      if (!result.error) {
        setHtml("");
        setEditorKey((k) => k + 1);
      }
      return result;
    },
    initialState,
  );
  const isEmpty = html.trim() === "";

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
              <AvatarHoverCard userId={c.authorId} name={c.author} avatarUrl={c.avatarUrl} size={28} />
              <div className="min-w-0">
                <div className="font-body text-[11px] text-grey-400">
                  <Link href={`/jugador/${c.authorId}`} className="text-line-white font-semibold hover:underline">
                    {c.author}
                  </Link>{" "}
                  · {fmt(c.createdAt)}
                </div>
                <div
                  className="font-body text-sm text-line-white break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-0 [&_strong]:font-bold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              </div>
            </li>
          ))
        )}
      </ul>

      <form action={action} className="flex flex-col gap-2 p-3 border-t-[3px] border-border">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="body" value={html} />
        <RichTextEditor key={editorKey} onChange={setHtml} />
        {state.error && <p className="font-body text-sm text-card-red">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending || isEmpty} className="self-end">
          {pending ? "Enviando..." : "Comentar"}
        </Button>
      </form>
    </section>
  );
}
