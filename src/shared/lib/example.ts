/**
 * Utilidad trivial usada por el test de humo para verificar que el alias `@/…`
 * resuelve dentro de Vitest. Se puede borrar cuando exista código real en `shared`.
 */
export function greet(name: string): string {
  return `Hola, ${name}`;
}
