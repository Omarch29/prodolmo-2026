/**
 * Reglas de negocio parametrizables.
 *
 * Mantener en sync con la función SQL `prediction_lock_interval()`
 * (supabase/migrations/0001_init_schema.sql), que es la fuente de verdad
 * en la base de datos. Acá se expone para la UI (countdowns, deshabilitar
 * inputs, etc.).
 */

/** Horas antes del kickoff en que se cierra la carga/edición de pronósticos. */
export const PREDICTION_LOCK_HOURS = 1;

/** Milisegundos antes del kickoff en que se cierra la carga. */
export const PREDICTION_LOCK_MS = PREDICTION_LOCK_HOURS * 60 * 60 * 1000;

/**
 * ¿El pronóstico es editable para un partido con este kickoff?
 * (validación de conveniencia para el front; el backend y RLS son la barrera real).
 */
export function isPredictionEditable(kickoffAt: Date, now: Date = new Date()): boolean {
  return now.getTime() < kickoffAt.getTime() - PREDICTION_LOCK_MS;
}

/**
 * ¿Ya son visibles los pronósticos ajenos para este partido?
 * (a partir de kickoff − lock se cierran y se vuelven visibles).
 */
export function arePredictionsVisible(kickoffAt: Date, now: Date = new Date()): boolean {
  return now.getTime() >= kickoffAt.getTime() - PREDICTION_LOCK_MS;
}

/**
 * Etapa (sort_order) a partir de la cual los pronósticos AJENOS quedan ocultos
 * hasta que el partido se bloquea (kickoff − 1h). Grupos (1) y Ronda de 32 (2)
 * se ven siempre; Octavos (3) en adelante, recién al cerrarse.
 */
export const HIDE_OTHERS_PICKS_FROM_SORT_ORDER = 3;

/** ¿Se pueden ver los pronósticos AJENOS de un partido de esta etapa, ahora? */
export function othersPicksVisible(
  stageSortOrder: number,
  kickoffAt: Date,
  now: Date = new Date(),
): boolean {
  if (stageSortOrder < HIDE_OTHERS_PICKS_FROM_SORT_ORDER) return true;
  return arePredictionsVisible(kickoffAt, now);
}

/** Horas antes del kickoff en que se dispara la alerta roja de "sin cargar". */
export const SOON_ALERT_HOURS = 2;

/** ¿El partido arranca dentro de la ventana de alerta (y todavía no arrancó)? */
export function isMatchSoon(kickoffAt: Date, now: Date = new Date()): boolean {
  const ms = kickoffAt.getTime() - now.getTime();
  return ms > 0 && ms <= SOON_ALERT_HOURS * 60 * 60 * 1000;
}
