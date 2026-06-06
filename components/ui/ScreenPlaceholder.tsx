/** Esqueleto de pantalla — placeholder navegable mientras no hay lógica. */
export function ScreenPlaceholder({
  emoji,
  title,
  note,
}: {
  emoji: string;
  title: string;
  note: string;
}) {
  return (
    <div className="p-4 md:p-8">
      <h1 className="font-display text-line-white text-sm md:text-lg flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h1>
      <p className="font-body text-grey-300 text-sm mt-4 max-w-prose">{note}</p>
      <div className="mt-6 bg-scoreboard-slate border-pixel-thick shadow-pixel p-6 font-body text-sm text-grey-300">
        Pantalla en construcción — por ahora solo el esqueleto navegable.
      </div>
    </div>
  );
}
