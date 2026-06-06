import { z } from "zod";

export const savePredictionSchema = z.object({
  matchId: z.string().uuid(),
  predHome: z.coerce.number().int().min(0).max(30),
  predAway: z.coerce.number().int().min(0).max(30),
  // En eliminación con empate: equipo que pasa. Vacío -> undefined.
  winnerTeamId: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().uuid().optional(),
  ),
});

export type SavePredictionInput = z.infer<typeof savePredictionSchema>;
