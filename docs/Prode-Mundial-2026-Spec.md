# Prode Mundial FIFA 2026 — Documento de Producto y Desglose Técnico

> Documento de diseño funcional + técnico para una app de Prode privada (grupo de amigos).
> Pensado para guiar el desarrollo: describe cada pantalla, las reglas de negocio,
> las queries/comandos necesarios y una propuesta de modelo de datos.

---

## 1. Visión general

App privada de pronósticos del Mundial 2026. Un grupo cerrado de usuarios (sin registro abierto).
Cada usuario carga el resultado que cree que va a salir en cada partido, suma puntos según acierte,
y compite contra sus amigos en una tabla de posiciones. El producto se apoya fuertemente en
**mensajes personalizados diarios** que le dan vida y "picante" a la competencia.

### Formato del Mundial 2026 (relevante para el modelo de datos)
- **48 selecciones**, **12 grupos** de 4 (A–L).
- Etapas: Fase de grupos → Ronda de 32 (R32) → Octavos (R16) → Cuartos → Semifinales → Tercer puesto → Final.
- Esto importa para el gráfico "puntos por sección" y para poder dar más valor a las rondas finales.

### Decisiones de diseño asumidas (ajustables)
Estas las definí yo para que el sistema cierre. Cambialas si querés:

1. **Sistema de puntos** (asimétrico y escalonado): puntaje base **0 / 1 / 3** por partido, multiplicado según la ronda.
   - *Fallo* (errás el resultado): 0.
   - *Acierto de resultado* (acertás ganador o empate, pero no el marcador): 1 punto base.
   - *Pleno* (marcador exacto, ej. 2-1 = 2-1): 3 puntos base. El marcador exacto **ya incluye** el resultado: no se suman (el puntaje base de un partido es 0, 1 o 3, **nunca 4**).
   - Ese puntaje base se multiplica por la ronda (grupos ×1 hasta final / 3.º puesto ×6), de modo que la eliminación pesa más y la definición sigue abierta hasta el final. Detalle completo en §3.
2. **Cierre de carga / visibilidad (anti-trampa)**: una predicción se puede **editar hasta 1 hora antes** del inicio del partido. En ese mismo momento (kickoff − 1h) la predicción **se cierra y se vuelve visible** para el resto. Esto evita que alguien vea las cargas ajenas y copie. *(Vos lo describiste como "ver resultados de amigos solo si falta 1h o el partido ya empezó" — alineé el cierre con la visibilidad para que no haya ventana de copia.)*
3. **Stack de referencia**: PostgreSQL como base. Las queries están en SQL estándar (Postgres) y son adaptables a cualquier motor.
4. **"Partidos ganados"** (KPI) lo interpreto como *partidos en los que sumaste puntos* (acertaste algo). **"Plenos"** = aciertos exactos.

---

## 2. Modelo de datos (esquema de base de datos)

### 2.1 Diagrama conceptual (relaciones)

```
users ──< predictions >── matches >── stages
  │            │              │
  │            │              ├── groups
  │            │              ├── home_team ─┐
  │            │              └── away_team ─┴── teams
  │
  ├──< comments >── matches
  ├──< daily_messages
  └──< simulations ──< simulation_picks ── matches / bracket_slots
```

### 2.2 Tablas

#### `users`
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| username | text unique | login |
| password_hash | text | nunca guardar texto plano |
| display_name | text | nombre que ven los demás |
| avatar_url | text null | opcional |
| timezone | text | ej. `America/Argentina/Buenos_Aires` (para horarios de carga) |
| created_at | timestamptz | |

#### `teams` (selecciones)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| name | text | "Argentina" |
| code | text(3) | "ARG" |
| group_id | FK groups null | null hasta el sorteo |
| flag_url | text | |
| status | enum | `active` / `eliminated` |

#### `groups` (grupos A–L)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| name | text | "A", "B", ... |

#### `stages` (etapas / secciones — sirve para el gráfico)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| name | text | "Fase de grupos", "Octavos", "Final"... |
| sort_order | int | para ordenar el gráfico |
| points_exact | int | puntos por pleno en esta etapa = **3 × multiplicador de la ronda** |
| points_outcome | int | puntos por acertar el resultado = **1 × multiplicador de la ronda** |

#### `matches` (partidos)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| stage_id | FK stages | |
| group_id | FK groups null | null en eliminatorias |
| matchday | int null | "Jornada/fecha" dentro de fase de grupos |
| home_team_id | FK teams null | null si aún es "ganador de X" (TBD) |
| away_team_id | FK teams null | |
| kickoff_at | timestamptz | clave para cierre/visibilidad y "partido más cercano" |
| venue | text | |
| status | enum | `scheduled` / `in_progress` / `finished` |
| home_score | int null | se llena al finalizar |
| away_score | int null | |

**Índices recomendados:** `(kickoff_at)`, `(status)`, `(stage_id)`, `(group_id)`.

#### `predictions` (pronósticos)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| user_id | FK users | |
| match_id | FK matches | |
| pred_home_score | int | |
| pred_away_score | int | |
| points_earned | int null | se calcula al finalizar el partido |
| submitted_at | timestamptz | última vez que cargó/editó (KPIs de horario y anticipación) |
| created_at | timestamptz | |
| **UNIQUE(user_id, match_id)** | | un pronóstico por usuario por partido |

**Índices:** `unique(user_id, match_id)`, `(match_id)`, `(user_id)`.

#### `comments` (comentarios en partidos)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| user_id | FK users | |
| match_id | FK matches | |
| body | text | |
| created_at | timestamptz | |

**Índice:** `(match_id, created_at)`.

#### `daily_messages` (mensajes diarios precomputados)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| user_id | FK users | |
| message_date | date | día al que corresponde |
| type | enum | ver §6 (pending_today, overtaken, gap_to_leader, last_place, surprise_result, lone_hit, streak...) |
| body | text | texto ya renderizado y listo para mostrar |
| priority | int | orden de aparición en el dashboard |
| metadata | jsonb | datos estructurados (ids de partido/usuario/etc.) por si la UI quiere linkear |
| created_at | timestamptz | |

**Índice:** `(user_id, message_date)`.

#### `simulations` (simulador del Mundial — por usuario, no afecta puntos reales)
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| user_id | FK users | |
| name | text | el usuario puede tener varios escenarios |
| created_at / updated_at | timestamptz | |

#### `simulation_picks`
| Campo | Tipo | Notas |
|---|---|---|
| id | PK | |
| simulation_id | FK simulations | |
| match_id | FK matches null | para fase de grupos (fixture fijo) |
| bracket_slot | text null | para eliminatorias (ej. "R16-1", "QF-3") |
| winner_team_id | FK teams | quién avanza/gana |
| home_score / away_score | int null | opcional, si el sim quiere marcador |

> El simulador es **hipotético**: nunca se mezcla con `predictions` ni con la tabla real de puntos.

---

## 3. Sistema de puntuación (asimétrico y escalonado)

**Objetivo del diseño:** como el formato 2026 tiene muchos partidos en fase de grupos y pocos en eliminación, los puntos de la eliminación escalan ronda a ronda. Así nadie se escapa solo por tener suerte en grupos y la definición sigue abierta hasta la final.

### Puntaje base por partido (aplica a cualquier fase)
- **0** si se erra el resultado del partido.
- **1** si se acierta el resultado (quién gana, o el empate) pero **no** el marcador exacto.
- **3** si se acierta el marcador exacto.

> **Importante:** el marcador exacto ya incluye el resultado. **No se suman** ambos. El puntaje base de un partido es siempre **0, 1 o 3 (nunca 4).**

### Multiplicador por ronda (multiplica el puntaje base)
| Ronda | Multiplicador | Acierto de resultado | Marcador exacto |
|---|---|---|---|
| Fase de grupos | ×1 | 1 | 3 |
| Ronda de 32 | ×2 | 2 | 6 |
| Octavos | ×3 | 3 | 9 |
| Cuartos | ×4 | 4 | 12 |
| Semifinales | ×5 | 5 | 15 |
| Final y 3.º puesto | ×6 | 6 | 18 |

> En el modelo de datos esto se guarda por etapa: `points_outcome = 1 × multiplicador` y `points_exact = 3 × multiplicador`.

### Máximo de puntos por fase (referencia)
| Fase | Cálculo | Máximo |
|---|---|---|
| Grupos | 72 × 3 | 216 |
| Ronda de 32 | 16 × 6 | 96 |
| Octavos | 8 × 9 | 72 |
| Cuartos | 4 × 12 | 48 |
| Semifinales | 2 × 15 | 30 |
| Final + 3.º puesto | 2 × 18 | 36 |
| **Subtotal eliminación** | | **282** |
| **Total del torneo** | | **498** |

> Reparto del torneo: grupos ≈ 43 % · eliminación ≈ 57 %.

### Cálculo al finalizar un partido
Al pasar un partido a `status = 'finished'` (con `home_score`/`away_score` cargados) se calculan los puntos de **todos** los pronósticos de ese partido. El `CASE` devuelve `points_exact` **o** `points_outcome` **o** 0 — nunca la suma de ambos:

```sql
UPDATE predictions p
SET points_earned = CASE
    WHEN p.pred_home_score = m.home_score
     AND p.pred_away_score = m.away_score
        THEN s.points_exact                                   -- PLENO (3 × mult)
    WHEN sign(p.pred_home_score - p.pred_away_score)
       = sign(m.home_score - m.away_score)
        THEN s.points_outcome                                 -- acertó resultado 1/X/2 (1 × mult)
    ELSE 0
END
FROM matches m
JOIN stages s ON s.id = m.stage_id
WHERE p.match_id = m.id
  AND m.id = $matchId;
```

> `sign(a - b)` resuelve elegantemente local/empate/visitante: misma señal = mismo resultado.

---

## 4. Reglas de negocio clave

- **Edición de pronóstico:** permitida solo si `now() < kickoff_at - interval '1 hour'`.
- **Visibilidad de pronósticos ajenos:** un usuario ve los de los demás solo si `now() >= kickoff_at - interval '1 hour'` (incluye en curso y finalizado).
- **Cálculo de puntos:** se dispara al pasar un partido a `finished`.
- **Recálculo de tabla y mensajes:** job diario (§6) + recálculo inmediato al cargar resultados.

Helper de visibilidad (úsalo en toda la app):
```sql
-- TRUE si ya se pueden mostrar pronósticos ajenos para este partido
SELECT now() >= kickoff_at - interval '1 hour' AS predictions_visible
FROM matches WHERE id = $matchId;
```

---

## 5. Pantallas (desglose funcional + técnico)

### 5.1 Login
**Función:** primera pantalla. Lista cerrada de usuarios, sin auto-registro.

**Comandos/queries:**
```sql
-- Validar credenciales
SELECT id, password_hash, display_name, timezone
FROM users
WHERE username = $username;
-- (En la app: comparar hash con bcrypt/argon2 y emitir sesión/JWT)
```
**UI:** usuario + contraseña → botón ingresar → redirige al Dashboard.

---

### 5.2 Dashboard (pantalla principal post-login)
**Función:** lo más importante es empujar al usuario a **cargar el próximo partido** + mostrarle los mensajes personalizados del día.

**A) Partido más cercano por vencer que todavía no cargó:**
```sql
SELECT m.*, ht.name AS home, at.name AS away,
       (m.kickoff_at - interval '1 hour') AS cierra_carga
FROM matches m
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
LEFT JOIN predictions p
       ON p.match_id = m.id AND p.user_id = $userId
WHERE m.kickoff_at > now()
  AND p.id IS NULL                       -- todavía no lo cargó
ORDER BY m.kickoff_at ASC
LIMIT 1;
```
> Si no hay ninguno sin cargar, mostrar el próximo partido igualmente (sacando el `p.id IS NULL`) como "ya cargado ✓".

**B) Mensajes del día (precomputados, ver §6):**
```sql
SELECT type, body, metadata
FROM daily_messages
WHERE user_id = $userId
  AND message_date = current_date
ORDER BY priority ASC;
```

**C) Resumen rápido de hoy (opcional, para el header):**
```sql
SELECT count(*) AS partidos_hoy
FROM matches
WHERE kickoff_at::date = current_date;
```

---

### 5.3 Lista de partidos (jugados / por jugar)
**Función:** ver el fixture completo, separando jugados de pendientes, con lo que cargó el usuario.

**Por jugar:**
```sql
SELECT m.*, ht.name AS home, at.name AS away,
       p.pred_home_score, p.pred_away_score,
       (p.id IS NOT NULL) AS ya_cargado,
       (now() < m.kickoff_at - interval '1 hour') AS editable
FROM matches m
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = $userId
WHERE m.status = 'scheduled' AND m.kickoff_at > now()
ORDER BY m.kickoff_at ASC;
```

**Jugados:**
```sql
SELECT m.*, ht.name AS home, at.name AS away,
       p.pred_home_score, p.pred_away_score, p.points_earned
FROM matches m
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = $userId
WHERE m.status = 'finished'
ORDER BY m.kickoff_at DESC;
```

---

### 5.4 Detalle de partido
**Función:** info del partido, comentarios, tu pronóstico, y los de tus amigos (solo si ya es visible).

**A) Datos del partido + tu pronóstico (siempre visible para vos):**
```sql
SELECT m.*, ht.name AS home, at.name AS away, s.name AS etapa,
       p.pred_home_score AS mi_local, p.pred_away_score AS mi_visita,
       (now() >= m.kickoff_at - interval '1 hour') AS predicciones_visibles,
       (now() <  m.kickoff_at - interval '1 hour') AS puedo_editar
FROM matches m
JOIN stages s ON s.id = m.stage_id
LEFT JOIN teams ht ON ht.id = m.home_team_id
LEFT JOIN teams at ON at.id = m.away_team_id
LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = $userId
WHERE m.id = $matchId;
```

**B) Pronósticos de amigos (ejecutar SOLO si `predicciones_visibles = true`):**
```sql
SELECT u.display_name, p.pred_home_score, p.pred_away_score, p.points_earned
FROM predictions p
JOIN users u ON u.id = p.user_id
WHERE p.match_id = $matchId
ORDER BY u.display_name;
```

**C) Cargar / editar pronóstico (validar cierre en backend):**
```sql
-- En backend: rechazar si now() >= kickoff_at - 1h
INSERT INTO predictions (user_id, match_id, pred_home_score, pred_away_score, submitted_at, created_at)
VALUES ($userId, $matchId, $home, $away, now(), now())
ON CONFLICT (user_id, match_id)
DO UPDATE SET pred_home_score = EXCLUDED.pred_home_score,
              pred_away_score = EXCLUDED.pred_away_score,
              submitted_at    = now();
```
Guard recomendado (defensa en DB además del backend):
```sql
-- Verificar que aún se puede cargar antes del INSERT
SELECT (now() < kickoff_at - interval '1 hour') AS editable
FROM matches WHERE id = $matchId;
```

**D) Comentarios:**
```sql
-- Listar
SELECT c.id, c.body, c.created_at, u.display_name
FROM comments c JOIN users u ON u.id = c.user_id
WHERE c.match_id = $matchId
ORDER BY c.created_at ASC;

-- Crear
INSERT INTO comments (user_id, match_id, body, created_at)
VALUES ($userId, $matchId, $body, now());
```

---

### 5.5 Detalle de usuario (KPIs + gráfico + posición)
**Función:** perfil con métricas, gráfico por sección, posición y vecinos en la tabla.

**A) KPIs principales:**
```sql
SELECT
  count(*) FILTER (WHERE p.points_earned > 0)                              AS partidos_ganados,
  count(*) FILTER (WHERE p.pred_home_score = m.home_score
                     AND p.pred_away_score = m.away_score)                 AS plenos,
  count(*)                                                                 AS total_cargados,
  coalesce(sum(p.points_earned), 0)                                        AS puntos_totales
FROM predictions p
JOIN matches m ON m.id = p.match_id
WHERE p.user_id = $userId AND m.status = 'finished';
```

**B) Horario promedio de carga** (a qué hora del día suele cargar, en su zona horaria):
```sql
SELECT avg( (p.submitted_at AT TIME ZONE u.timezone)::time ) AS horario_promedio
FROM predictions p
JOIN users u ON u.id = p.user_id
WHERE p.user_id = $userId;
```

**C) Anticipación promedio** (cuánto antes del inicio carga):
```sql
SELECT avg(m.kickoff_at - p.submitted_at) AS anticipacion_promedio
FROM predictions p
JOIN matches m ON m.id = p.match_id
WHERE p.user_id = $userId
  AND p.submitted_at < m.kickoff_at;
```

**D) Gráfico: puntos por sección (% sobre el máximo posible):**
```sql
SELECT s.name AS seccion,
       coalesce(sum(p.points_earned), 0)                       AS obtenidos,
       sum(s.points_exact)                                     AS maximo_posible,
       round(100.0 * coalesce(sum(p.points_earned),0)
             / nullif(sum(s.points_exact),0), 1)               AS porcentaje
FROM matches m
JOIN stages s ON s.id = m.stage_id
LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = $userId
WHERE m.status = 'finished'
GROUP BY s.name, s.sort_order
ORDER BY s.sort_order;
```
> `maximo_posible` = puntos si hubiera hecho pleno en todos los partidos finalizados de esa etapa. La UI dibuja una barra por sección con el `porcentaje`.

**E) Posición + quién lo pasa y quién está debajo:**
```sql
WITH tabla AS (
  SELECT u.id, u.display_name,
         coalesce(sum(p.points_earned),0) AS puntos,
         rank() OVER (ORDER BY coalesce(sum(p.points_earned),0) DESC) AS pos
  FROM users u
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN matches m ON m.id = p.match_id AND m.status = 'finished'
  GROUP BY u.id, u.display_name
),
yo AS (SELECT pos, puntos FROM tabla WHERE id = $userId)
SELECT t.*,
       CASE
         WHEN t.pos = (SELECT pos FROM yo) THEN 'yo'
         WHEN t.pos = (SELECT pos FROM yo) - 1 THEN 'arriba'
         WHEN t.pos = (SELECT pos FROM yo) + 1 THEN 'abajo'
       END AS relacion
FROM tabla t
WHERE t.pos BETWEEN (SELECT pos FROM yo) - 1 AND (SELECT pos FROM yo) + 1
ORDER BY t.pos;
```

---

### 5.6 Tabla de posiciones (todos los usuarios)
```sql
SELECT u.id, u.display_name,
       coalesce(sum(p.points_earned), 0)                                  AS puntos,
       count(*) FILTER (WHERE p.pred_home_score = m.home_score
                          AND p.pred_away_score = m.away_score)           AS plenos,
       count(*) FILTER (WHERE p.points_earned > 0)                        AS aciertos,
       rank() OVER (ORDER BY coalesce(sum(p.points_earned),0) DESC,
                             count(*) FILTER (WHERE p.pred_home_score = m.home_score
                                                AND p.pred_away_score = m.away_score) DESC) AS posicion
FROM users u
LEFT JOIN predictions p ON p.user_id = u.id
LEFT JOIN matches m ON m.id = p.match_id AND m.status = 'finished'
GROUP BY u.id, u.display_name
ORDER BY posicion;
```
> Desempate sugerido: a igual puntaje, gana quien tenga más plenos (configurable).
> Para grupos chicos esta query corre directo. Si querés cachear, materializala y refrescala al cerrar cada partido.

---

### 5.7 Simulador del Mundial
**Función:** el usuario completa quién gana cada cruce para proyectar quién sale campeón. **No afecta los puntos reales.**

**A) Crear/cargar un escenario:**
```sql
-- crear
INSERT INTO simulations (user_id, name, created_at, updated_at)
VALUES ($userId, $name, now(), now()) RETURNING id;

-- cargar picks de un escenario
SELECT sp.*, t.name AS winner
FROM simulation_picks sp
JOIN teams t ON t.id = sp.winner_team_id
WHERE sp.simulation_id = $simId;
```

**B) Guardar un pick (upsert por slot):**
```sql
INSERT INTO simulation_picks (simulation_id, match_id, bracket_slot, winner_team_id)
VALUES ($simId, $matchId, $slot, $teamId)
ON CONFLICT (simulation_id, bracket_slot)
DO UPDATE SET winner_team_id = EXCLUDED.winner_team_id;
```

**C) Lógica de propagación del bracket (en backend, no SQL):**
- Cada `bracket_slot` (ej. `R16-1`) alimenta al siguiente (`QF-1`).
- Al elegir ganador en un slot, se setea ese equipo como participante del slot siguiente.
- El campeón = `winner_team_id` del slot `FINAL`.

> Sugerencia: definí una tabla de configuración del bracket (`bracket_slots`: slot, etapa, slot_destino) para que la propagación sea data-driven y no quede hardcodeada.

---

## 6. Job diario de mensajes personalizados

Es el corazón "social" del producto. Corre una vez por día (ej. de madrugada) y **precalcula** un set de mensajes por usuario en `daily_messages`. Así el dashboard solo lee, sin cómputo pesado en tiempo real.

> Idea clave: para detectar "quién te pasó" necesitás una **foto de la tabla del día anterior**. Guardá un snapshot diario (tabla `standings_snapshots(user_id, date, puntos, pos)`) o derivá la posición de ayer filtrando partidos `finished` hasta ayer.

### Tipos de mensaje y cómo calcularlos

**1. `pending_today` — "Hoy hay N partidos, todavía no cargaste ninguno"**
```sql
SELECT
  (SELECT count(*) FROM matches WHERE kickoff_at::date = current_date)   AS partidos_hoy,
  (SELECT count(*) FROM predictions p
     JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = $userId AND m.kickoff_at::date = current_date)     AS cargados;
-- Si cargados = 0 y partidos_hoy > 0 → generar mensaje.
```

**2. `overtaken` — "Ayer te pasó Julián con la victoria de Paraguay"**
Comparar posición de ayer vs hoy y detectar quién te superó:
```sql
-- pos de hoy vs ayer (usando snapshots)
SELECT s_hoy.pos AS pos_hoy, s_ayer.pos AS pos_ayer
FROM standings_snapshots s_hoy
JOIN standings_snapshots s_ayer
  ON s_ayer.user_id = s_hoy.user_id AND s_ayer.date = current_date - 1
WHERE s_hoy.user_id = $userId AND s_hoy.date = current_date;
```
Luego, si `pos_hoy > pos_ayer` (bajaste), encontrar al usuario que cruzó tu puntaje ayer, y el partido que más puntos le dio (para el "con la victoria de Paraguay"):
```sql
SELECT u.display_name, m.id, ht.name AS home, at.name AS away, p.points_earned
FROM predictions p
JOIN matches m ON m.id = p.match_id
JOIN users u ON u.id = p.user_id
JOIN teams ht ON ht.id = m.home_team_id
JOIN teams at ON at.id = m.away_team_id
WHERE m.kickoff_at::date = current_date - 1
  AND p.user_id = $rivalId
ORDER BY p.points_earned DESC
LIMIT 1;
```

**3. `gap_to_leader` — "Estás a 5 puntos del líder"**
```sql
WITH tabla AS (
  SELECT u.id, coalesce(sum(p.points_earned),0) AS puntos
  FROM users u
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN matches m ON m.id = p.match_id AND m.status = 'finished'
  GROUP BY u.id
)
SELECT (SELECT max(puntos) FROM tabla) - (SELECT puntos FROM tabla WHERE id = $userId) AS gap;
```

**4. `last_place` — "Estás último en la lista"**
Usar la query de tabla (§5.6): si `posicion = (SELECT max(posicion) ...)` → generar.

**5. `surprise_result` / `nobody_hit` — "Increíble goleada de Brasil ayer, nadie la adivinó"**
Partidos de ayer con gran diferencia y **cero** plenos:
```sql
SELECT m.id, ht.name AS home, at.name AS away, m.home_score, m.away_score,
       count(*) FILTER (WHERE p.pred_home_score = m.home_score
                          AND p.pred_away_score = m.away_score) AS plenos
FROM matches m
JOIN teams ht ON ht.id = m.home_team_id
JOIN teams at ON at.id = m.away_team_id
LEFT JOIN predictions p ON p.match_id = m.id
WHERE m.status = 'finished'
  AND m.kickoff_at::date = current_date - 1
  AND abs(m.home_score - m.away_score) >= 3        -- "goleada" (umbral configurable)
GROUP BY m.id, ht.name, at.name, m.home_score, m.away_score
HAVING count(*) FILTER (WHERE p.pred_home_score = m.home_score
                          AND p.pred_away_score = m.away_score) = 0;
```

**6. `lone_hit` — "Sorprendentemente Carlos acertó el resultado"**
Partido sorpresa donde **un solo** usuario hizo pleno:
```sql
SELECT m.id, max(u.display_name) AS unico_acertante
FROM matches m
JOIN predictions p ON p.match_id = m.id
JOIN users u ON u.id = p.user_id
WHERE m.status = 'finished'
  AND m.kickoff_at::date = current_date - 1
  AND p.pred_home_score = m.home_score
  AND p.pred_away_score = m.away_score
GROUP BY m.id
HAVING count(*) = 1;
```

**7. `streak` — "Pablo está en racha: adivinó 3 resultados perfectos esta fecha"**
Usuarios con N+ plenos en la fecha/jornada:
```sql
SELECT u.display_name, count(*) AS plenos_fecha
FROM predictions p
JOIN matches m ON m.id = p.match_id
JOIN users u ON u.id = p.user_id
WHERE m.status = 'finished'
  AND m.matchday = $fechaActual           -- o por rango de fechas del día
  AND p.pred_home_score = m.home_score
  AND p.pred_away_score = m.away_score
GROUP BY u.id, u.display_name
HAVING count(*) >= 3;
```

### Inserción de los mensajes
```sql
INSERT INTO daily_messages (user_id, message_date, type, body, priority, metadata, created_at)
VALUES ($userId, current_date, $type, $textoRenderizado, $priority, $jsonMeta, now());
```

### Orden de ejecución del job (pseudocódigo)
```
1. Refrescar puntos de todos los partidos que pasaron a 'finished'.
2. Tomar snapshot de la tabla del día → standings_snapshots.
3. Por cada usuario: calcular los tipos de mensaje (queries de arriba).
4. Renderizar el texto (plantillas) y volcar en daily_messages.
5. (Opcional) Disparar push/email con el resumen del día.
```

---

## 7. Consideraciones técnicas

- **Sesiones/auth:** JWT o sesión de servidor. Hash de contraseñas con bcrypt/argon2.
- **Validación de cierre:** hacerla **siempre en backend** (no confiar en el front). El guard en DB es defensa extra.
- **Tabla de posiciones:** para un grupo chico (decenas de usuarios) la query directa alcanza. Si querés, materializala y refrescala al cerrar cada partido.
- **Snapshots diarios:** imprescindibles para los mensajes de "te pasó / subiste / bajaste".
- **Carga de datos del fixture:** importar el calendario oficial del Mundial 2026 a `matches` (seed inicial) y actualizar `home_team_id`/`away_team_id` de eliminatorias a medida que se definan.
- **Zona horaria:** guardá todo en `timestamptz` (UTC) y convertí por `users.timezone` solo para mostrar y para el KPI de horario de carga.
- **Índices:** los listados arriba cubren los accesos calientes (kickoff_at, match_id en predictions, etc.).

---

## 8. Resumen de pantallas

| # | Pantalla | Núcleo | Queries principales |
|---|---|---|---|
| 1 | Login | autenticación | validar credenciales |
| 2 | Dashboard | empujar a cargar + mensajes del día | próximo partido sin cargar, daily_messages |
| 3 | Lista de partidos | fixture jugados/pendientes | matches por status + mi pronóstico |
| 4 | Detalle de partido | mi pron., pron. amigos (si visible), comentarios | visibilidad, upsert predicción, comentarios |
| 5 | Detalle de usuario | KPIs, gráfico por sección, posición/vecinos | KPIs, % por etapa, rank + adyacentes |
| 6 | Tabla de posiciones | ranking general | sum puntos + rank con desempate |
| 7 | Simulador | proyectar campeón (hipotético) | picks de bracket + propagación |
