# PRODE — Pixel Art Design System

A complete design system for **PRODE**, a World-Cup prediction game where a group of
friends predicts match results and earns points. The aesthetic is **retro pixel-art /
8–16-bit videogame** with a **football-pitch identity**: grass green, chalk-white lines,
scoreboard black, and the fun accents of yellow/red cards and goal orange.

> This is a **from-scratch** design system — there was no existing codebase, Figma file, or
> deck to reference. It was built from the written visual brief. All tokens, components, and
> screens below are original.

---

## Product context

PRODE (from *pronósticos deportivos*) is a casual, social prediction game popular in Latin
America around big tournaments. The core loop:

1. A **fecha** (matchday) opens with several matches.
2. Each player loads a **pronóstico** (predicted score) per match via goal steppers.
3. They **confirm the fecha** before kickoff (after which picks lock).
4. Points are awarded for correct outcomes / exact scores.
5. A **leaderboard** ranks the friend group; profiles show points and achievements.

The single product surface is a **mobile app** (`ui_kits/prode-app/`). The whole system
is tuned to feel like a **retro arcade game menu** — playful, chunky, and tactile.

**Language:** UI copy is in **Argentine/Rioplatense Spanish** (voseo).

---

## CONTENT FUNDAMENTALS

**Voice:** Energetic, playful, like a friend hyping you up before a match. Arcade-game
announcer energy without being obnoxious.

- **Person & register:** Informal *vos* ("¿Querés cerrar la fecha?", "Vas ganando puntos",
  "No podés editar"). Never the formal *usted*. Speaks **to** the player ("tus puntos",
  "tus pronósticos").
- **Casing:** Pixel/display text is **UPPERCASE** (`JUGAR`, `CONFIRMAR PRONÓSTICO`,
  `TABLA`) — it reads like a game HUD. Body copy is sentence case.
- **Length:** Labels are 1–2 words. Toast titles are short and shouty
  (`¡GOOOL!`, `FECHA CERRADA`, `PRONÓSTICO GUARDADO`); the supporting line is one plain
  sentence.
- **Football slang & excitement:** Lean into it — `GOLAZO`, `¡GOOOL!`, `GOAT` 🐐,
  `los pibes`, exclamation marks on wins. Numbers are celebrated (scoreboard styling).
- **Emoji:** **Yes — emoji is part of the brand.** The football ⚽ is the recurring motif;
  flags 🇦🇷🇧🇷 mark teams; 🏆🎯🔥👑 mark achievements. Used as iconography, not decoration.

**Examples**
| Context | Copy |
|---|---|
| Primary CTA | `⚽ CONFIRMAR PRONÓSTICO` |
| Success toast | **PRONÓSTICO GUARDADO** — "Argentina 2 - 1 Brasil cargado." |
| Goal toast | **¡GOOOL!** — "Messi marcó. ¡Vas ganando puntos!" |
| Error toast | **FECHA CERRADA** — "El partido ya empezó, no podés editar." |
| Modal warning | "Una vez confirmada la fecha no vas a poder cambiar tus pronósticos." |

---

## VISUAL FOUNDATIONS

The system is unapologetically **chunky, hard-edged, and pixelated**. Everything reads like
a 16-bit game screen.

- **Colors:** Limited, vibrant, pitch-themed. Grass green is the base/brand; line-white is
  surface/chalk; scoreboard-black is the dark UI/ink. Accents are literal football objects —
  `card-yellow`, `card-red`, `goal-orange`, plus a `sky-blue` for info. Greys are slightly
  warm/olive to sit with the grass. Full palette in `colors_and_type.css`.
- **Type:** **Press Start 2P** for display/titles/HUD labels (runs large & blocky — kept at
  modest sizes, UPPERCASE, wide tracking). **VT323** for big tabular numerals (scoreboards,
  steppers, points). **Space Grotesk** for readable long body text and names. *(All three are
  Google Fonts — see caveat below.)*
- **Borders:** Hard, solid, **dark (`scoreboard-ink`)**, **never** soft-rounded.
  `--radius` is `0px` everywhere. Weights: 2 / 3 / 4 / 6 px.
- **Shadows:** **Hard pixel offset, zero blur** — `box-shadow: 4px 4px 0 #0B0E13`. No
  diffuse/gradient shadows ever. Scale: xs(2) / base(4) / lg(6) / xl(8) / pressed(1).
- **Backgrounds:** Solid color fills + **pure-CSS textures**: grass uses repeating vertical
  mowing stripes; the dark UI uses a faint pixel-grid; modals sit on a green pitch backdrop.
  No photos, no soft gradients.
- **Press / hover states:** This is the signature interaction. **Hover** lightens the fill.
  **Pressed** physically *sinks the button*: `transform: translate(3px,3px)` while the shadow
  collapses to `1px 1px 0` — like a real arcade button. Transitions are tiny and **stepped**
  (`steps(2)`) so motion looks digital, not smooth.
- **Disabled:** Desaturated grey fill + grey border + grey (not black) shadow, no transform.
- **Animation:** Minimal and snappy. Toasts pop in with a 2-step keyframe. No easing curves,
  no bounce, no infinite loops. Motion should feel like sprite frames, not CSS easing.
- **Corner radii:** `0` — pixels don't do round.
- **Cards:** White (`line-white`) body, 4px black border, hard offset shadow, a dark
  scoreboard-style header strip. No rounding, no inner shadow, no blur.
- **Layout:** 4px pixel grid for all spacing. Mobile-first, single 390px phone column. Bottom
  nav is fixed; top bar is fixed. Tap targets ≥ 44px.
- **Transparency/blur:** Used only for the modal scrim (`rgba(11,14,19,.7)`), never blur.
- **Imagery vibe:** There is no photography — identity is carried by flat color, emoji, and
  CSS texture. Warm, saturated, high-contrast, "stadium under lights."

---

## ICONOGRAPHY

**The icon system is emoji**, by design — it matches the playful, social, pan-regional tone
and renders consistently across phones without shipping an icon font.

- **Recurring motif:** the football ⚽ — on the primary CTA, the app logo, the "jugar" nav
  item, goal toasts.
- **Teams:** flag emoji (🇦🇷 🇧🇷 🇫🇷 🇪🇸 …).
- **Navigation:** ⚽ jugar · 📋 fechas · 🏆 tabla · 👥 grupo · 👤 perfil. Inactive items are
  rendered **desaturated** (`filter: grayscale(1) opacity(.55)`); the active item shows full
  color on a dark-green pad.
- **Achievements / status:** 🎯 exacto · 🔥 racha · 👑 líder · 🐐 GOAT · 🧤 valla invicta · ✅ ⚠ 🟥
  for toasts/cards.
- **Avatars:** a single emoji centered in a square, thick-bordered frame (`.avatar`).
- **No SVG icon set, no icon font, no PNG sprites** — if a future surface needs line icons,
  substitute a pixel/blocky set (e.g. a 16-bit icon pack) rather than a thin-stroke modern
  set, to stay on-brand. Flag any such addition.

---

## Index / manifest

**Root**
- `README.md` — this file.
- `colors_and_type.css` — all design tokens: color palette (raw + semantic), type scale,
  borders, pixel shadows, spacing, plus `.ds-*` type classes and grass/net texture helpers.
- `PRODE Style Guide.html` — **the main deliverable**: single-page style guide showing every
  token and component with all states, laid out like a retro game menu.
- `SKILL.md` — Agent-Skills-compatible entry point.

**`preview/`** — small cards that populate the Design System tab (colors, type, borders,
shadows, spacing, and one per component).

**`ui_kits/prode-app/`** — interactive app UI kit (React + Babel):
- `index.html` — click-through prototype (load picks → confirm modal → toasts → table → profile).
- `kit.css` — app screen styles (`colors_and_type.css` is copied in locally).
- `components.jsx` — shared: `Avatar`, `Stepper`, `Btn`, `TopBar`, `BottomNav`, `Toast`, `Modal`.
- `screens.jsx` — `PlayScreen`, `TableScreen`, `ProfileScreen` (+ `MatchRow`).
- `App.jsx` — app shell wiring nav, state, modal, toasts, sample data.

---

## ⚠ Caveats / open questions
- **Fonts are loaded from Google Fonts CDN** (Press Start 2P, VT323, Space Grotesk), not
  bundled `.ttf` files. If you need an offline/self-contained build, drop the font files into
  a `fonts/` folder and swap the `@import` for `@font-face`.
- **No real brand assets existed** — there's no official logo. The wordmark is set in Press
  Start 2P. If PRODE has (or wants) a real logo/mascot, that should replace the text wordmark.
- The achievements, team list, and point values are sample content for the prototype.
