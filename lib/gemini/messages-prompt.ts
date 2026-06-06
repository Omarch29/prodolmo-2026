/**
 * Lógica pura para los mensajes diarios con IA (sin SDK ni red): construcción
 * del prompt y parseo defensivo de la respuesta. Testeable.
 */

export type RewriteItem = { type: string; body: string; displayName: string };

const SYSTEM = `Sos el narrador de un grupo de amigos que juega al PRODE del Mundial.
Reescribí cada mensaje con tono rioplatense, divertido y un poco chicanero, como
hincha que jode a los amigos. Reglas:
- Mantené EXACTAMENTE el sentido y los datos (números, nombres, puestos). NO inventes nada.
- Cortito: máximo ~140 caracteres por mensaje.
- Podés usar 1 emoji como mucho.
- Devolvé SOLO un JSON array de strings, en el MISMO orden y la MISMA cantidad que la entrada.`;

export function buildMessagesPrompt(items: RewriteItem[]): string {
  const payload = items.map((it, i) => ({ i, tipo: it.type, jugador: it.displayName, texto: it.body }));
  return `${SYSTEM}\n\nMensajes a reescribir (JSON):\n${JSON.stringify(payload, null, 2)}`;
}

function stripFences(text: string): string {
  return text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
}

/**
 * Parsea la respuesta del modelo. Si algo no cuadra (JSON inválido, distinta
 * cantidad, elemento vacío), cae al texto original (plantilla) por elemento.
 */
export function parseRewrites(text: string, originals: { body: string }[]): string[] {
  let arr: unknown;
  try {
    arr = JSON.parse(stripFences(text));
  } catch {
    return originals.map((o) => o.body);
  }
  if (!Array.isArray(arr) || arr.length !== originals.length) {
    return originals.map((o) => o.body);
  }
  return originals.map((o, i) => {
    const v = arr[i];
    return typeof v === "string" && v.trim() ? v.trim() : o.body;
  });
}
