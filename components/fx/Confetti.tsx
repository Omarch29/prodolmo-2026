"use client";

import type { CSSProperties } from "react";

// Paleta pixel para los papelitos.
const COLORS = ["#2FA84F", "#FFC83D", "#E23B3B", "#2FA1E8", "#FF7A1A", "#7BE294", "#F4F7EF"];
const COUNT = 30;

// Piezas determinísticas (sin Math.random en render) pero bien dispersas.
const PIECES = Array.from({ length: COUNT }, (_, i) => {
  const left = (i * 53 + 7) % 100;
  const size = 6 + ((i * 7) % 8); // 6..13px
  const delay = ((i * 29) % 25) / 100; // 0..0.24s
  const duration = 1.5 + ((i * 13) % 9) / 10; // 1.5..2.3s
  const color = COLORS[i % COLORS.length];
  return { left, size, delay, duration, color };
});

/**
 * Papelitos cayendo. Las animaciones CSS arrancan al montar; al cambiar de tab
 * se remonta (key) y vuelven a caer. Decorativo: no captura clicks.
 */
export function Confetti() {
  return (
    <div aria-hidden className="confetti-overlay pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {PIECES.map((p, i) => {
        const style: CSSProperties = {
          left: `${p.left}%`,
          width: p.size,
          height: p.size,
          backgroundColor: p.color,
          animation: `confetti-fall ${p.duration}s linear ${p.delay}s forwards`,
        };
        return <span key={i} className="absolute -top-3 block" style={style} />;
      })}
    </div>
  );
}
