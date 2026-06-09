# Features — PRODOLMO (Prode Mundial 2026)

Catálogo completo de funcionalidades del sistema. Para el "cómo está hecho" ver
[ARCHITECTURE.md](ARCHITECTURE.md); para la spec original, [Prode-Mundial-2026-Spec.md](Prode-Mundial-2026-Spec.md).

> La app se deploya desde la rama **`fun`**, que es **`main` + features humorísticas**.
> Las features serias están en `main`; las graciosas, al final de este doc en
> [Extras (rama fun)](#-extras-rama-fun).

---

## 🔐 Acceso y cuentas

- **Lista cerrada, sin auto-registro**: las cuentas las crea el admin con un
  script (`seed:users` / `seed:real`); login por **email + password** (Supabase Auth).
- **Sesión protegida** por un proxy (convención Next 16) que refresca cookies y
  bloquea rutas privadas.
- **Avatar propio**: cada jugador puede subir su foto (Supabase Storage).
- **Fondo de login** con imagen del Mundial.

## ⚽ Cargar pronósticos

- **Fixture completo** del Mundial 2026 (104 partidos) filtrable por **sección**
  (Grupos, Ronda de 32, Octavos, Cuartos, Semis, Final) y por **día**.
- **Carga/edición del marcador** con steppers; en eliminación, si pronosticás
  empate elegís **quién pasa de ronda**.
- **Cierre 1 h antes** del kickoff: después no se puede cargar ni editar (validado
  en backend **y** en RLS).
- **El filtro se conserva**: al entrar a un partido y volver (o tras guardar),
  regresás al mismo tab/sección/día en el que estabas.
- **Navegación Anterior / Siguiente** entre partidos desde el detalle, sin volver
  al listado, conservando el filtro de origen.
- **Contador "sin cargar"** que solo cuenta partidos con equipos definidos.
- **Aviso de cierre** (descartable con ✕, se recuerda) explicando el plazo de 1 h
  y la regla de visibilidad.

## 🏆 Sistema de puntos

- Por partido: **3** (marcador exacto), **1** (acertás resultado/empate), **0**
  (errás) — nunca se suman entre sí.
- **Multiplicador por ronda**: ×1 (grupos) … ×6 (final y 3.º puesto).
- **+20 puntos** por acertar el **campeón** del Mundial.
- El **cálculo vive en la base** (trigger de Postgres) y se dispara al finalizar
  el partido; la app nunca recalcula.

## 🙈 Visibilidad y anti-spoiler

- **Grupos** y **Ronda de 32**: los pronósticos del grupo se ven siempre.
- **Desde Octavos**: los pronósticos ajenos quedan **ocultos hasta que el partido
  se bloquea** (1 h antes), para que la competencia sea justa. Aplica en el
  **detalle del partido** y en el **feed de actividad** del jugador.
- Doble barrera: **RLS por etapa** en la base (migración `0015`) + gating en la UI
  (leyenda explicativa cuando corresponde).

## 📊 Tabla de posiciones

- Ranking por puntos, **desempate por plenos**, medallas (🥇🥈🥉) y 👑 al líder.
- **Movimiento ▲/▼** respecto a la foto del día anterior.
- Tocar una fila lleva al **detalle del jugador**.

## 👤 Detalle del jugador

- **KPIs**: puntos, plenos, aciertos, cargados.
- **Hábitos**: horario promedio de carga y anticipación promedio al kickoff.
- **Desglose por ronda**: obtenido vs máximo posible, con barra de progreso.
- **Posición en la tabla** con los vecinos (arriba / vos / abajo).
- **Avatar grande** y, debajo, **feed de actividad**:
  - **Todos sus pronósticos** como chips con banderitas y marcador, teñidos por
    acierto (con el `+N` si sumó).
  - **Últimos comentarios**, con el partido al que pertenecen.
- **Campeón elegido** visible; el propio se puede **elegir/modificar** hasta que
  arranque el Mundial.

## 🥇 Campeón del Mundial

- Cada jugador elige una selección como campeona; **+20** si acierta.
- Modal al ingresar (postergable) y selector desde el propio detalle.
- **Modificable** las veces que quieras hasta el primer partido; después se
  bloquea (botón deshabilitado).

## 💬 Comentarios

- **Por partido**, con **editor WYSIWYG** (TipTap): negrita, itálica, tachado y
  listas.
- El HTML se **sanitiza en el servidor** (allowlist de formato, sin scripts ni
  links) — anti-XSS, porque los ven todos.
- Avatares y nombres **linkean al perfil**.

## 🔔 Alertas

- **Alerta roja con cuenta regresiva** cuando un partido arranca en **menos de 2 h
  y todavía no lo cargaste** — en el inicio y en el detalle del partido.
- **Aviso de cierre** (1 h) descartable en la pantalla de carga.

## 🗓️ Agregar al calendario

- Botón **"Agendar en Google Calendar"** por partido: crea el evento con
  **banderas + códigos** en el título (`🇲🇽 MEX - 🇿🇦 RSA`), duración 2 h y la ronda
  en la descripción. Las banderas se derivan del **código FIFA**.

## 👥 Panel hover de avatares

- Al pasar el mouse (o enfocar) un avatar en cualquier lista, aparece un panel con
  **avatar grande, puntos, puesto y el campeón elegido**. Carga los datos al vuelo.

## 🎮 Simulador del Mundial

- Wizard para elegir 1.º/2.º de los 12 grupos, los **8 mejores terceros** y
  completar el **cuadro de eliminación** hasta el campeón. No afecta los puntos reales.

## 🏠 Inicio (dashboard)

- **Próximo partido por cargar** con cuenta regresiva.
- **Mensajes del día** personalizados.
- **Mini-tabla** y accesos rápidos. Layout de 2 columnas en desktop, hero en mobile.

## 🤖 IA (Gemini Flash)

- Reescribe los **mensajes del día** con tono rioplatense a partir de hechos ya
  calculados (te pasaron, gap al líder, racha, goleada que nadie acertó…).
- Genera **previas de partido**. La IA **solo redacta sobre hechos**; nunca inventa
  datos. Degradación elegante si no hay API key.

## ℹ️ Pantalla INFO

- Explica el **sistema de puntos** (0/1/3, multiplicadores por ronda, +20 campeón).
- Explica **carga y visibilidad**: cierre 1 h antes y la regla anti-spoiler desde
  Octavos.

## 🔄 Datos reales y sincronización

- Fixture y resultados desde **football-data.org**; upsert por `external_id`/`code`.
  Al pasar un partido a `finished` con marcador, el trigger recalcula puntos.
- **Cron en Vercel** (Hobby, ~1 vez/día) para sync y mensajes del día.
- **GitHub Action** que sincroniza **cada hora en la franja de partidos**
  (14:00–01:00 ART) para resultados al día durante la jornada.

## 🎨 Diseño y UX

- **Pixel-art** retro: tokens del design system (bordes gruesos, sombras duras sin
  blur, sin radios), fuentes Press Start 2P / VT323 / Space Grotesk.
- **Mobile-first**: BottomNav en mobile, Sidebar en desktop.
- **Transiciones** entre pantallas, **confetti** al sumar (con toggle para
  desactivarlo).

---

## 🎉 Extras (rama `fun`)

_(Solo en la rama `fun`, que es la que se deploya. Son features humorísticas.)_

El detalle de estas features está documentado en la rama **`fun`**. En `main` se
mantienen aparte para conservar la versión "seria" del proyecto.

<!-- FUN-EXTRAS -->
