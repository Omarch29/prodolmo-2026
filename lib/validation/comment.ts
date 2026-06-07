import { z } from "zod";

export const commentSchema = z.object({
  matchId: z.string().uuid(),
  body: z.string().trim().min(1, "Escribí algo.").max(500, "Máximo 500 caracteres."),
});

export type CommentInput = z.infer<typeof commentSchema>;
