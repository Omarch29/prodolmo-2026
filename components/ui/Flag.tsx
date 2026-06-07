import { cn } from "@/lib/utils";

/**
 * Bandera de una selección. `flag` puede ser una URL (escudo SVG de la API) o
 * un emoji (selecciones base del seed). Renderiza <img> o texto según el caso.
 */
export function Flag({
  flag,
  size = 24,
  className,
}: {
  flag: string | null;
  size?: number;
  className?: string;
}) {
  if (flag && /^https?:\/\//.test(flag)) {
    return (
      // Escudos externos (SVG); <img> evita habilitar SVG global en next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={flag}
        alt=""
        width={size}
        height={size}
        className={cn("inline-block object-contain align-middle", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span className={className} style={{ fontSize: size, lineHeight: 1 }}>
      {flag || "⚽"}
    </span>
  );
}
