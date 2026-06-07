const PALETTE = ["#7be294", "#ffc83d", "#e23b3b", "#2fa1e8", "#ff7a1a", "#54c96e"];

function pickColor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length] ?? "#7be294";
}

/** Avatar pixel: foto si hay `src`, si no la inicial sobre un color del nombre. */
export function Avatar({ name, src, size = 44 }: { name: string; src?: string | null; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="border-pixel object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
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
