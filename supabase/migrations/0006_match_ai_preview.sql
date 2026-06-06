-- ============================================================
-- Previa de partido generada por IA (Gemini), precomputada por el cron.
-- Se lee instantáneo en el detalle; null = sin previa todavía.
-- ============================================================
alter table public.matches
  add column ai_preview text;
