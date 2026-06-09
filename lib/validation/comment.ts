import { z } from "zod";

export const commentSchema = z.object({
  matchId: z.string().uuid(),
  // El body es HTML del editor WYSIWYG; el límite alto cubre las etiquetas.
  // El server lo sanitiza y valida que el texto no esté vacío.
  body: z.string().trim().min(1, "Escribí algo.").max(8000, "Comentario demasiado largo."),
});

export type CommentInput = z.infer<typeof commentSchema>;
