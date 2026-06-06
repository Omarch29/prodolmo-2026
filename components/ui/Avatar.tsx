const PALETTE = ["#7be294", "#ffc83d", "#e23b3b", "#2fa1e8", "#ff7a1a", "#54c96e"];

function pickColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length] ?? "#7be294";
}

/** Avatar pixel: inicial sobre un color derivado del nombre (estable). */
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="border-pixel flex items-center justify-center shrink-0 font-display text-ink"
      style={{
        width: size,
        height: size,
        background: pickColor(name),
        fontSize: Math.round(size * 0.4),
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
