/**
 * Une clases condicionalmente (filtra falsy). Helper mínimo, sin dependencias.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
