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
