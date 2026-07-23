export function limitarProgreso(progreso: number): number {
  if (!Number.isFinite(progreso)) return 0;
  return Math.min(1, Math.max(0, progreso));
}

/**
 * Traduce el progreso de scroll (0..1) a una posición fraccional de fotograma
 * dentro de una secuencia de `total` imágenes. El resultado vive en el rango
 * `0..total-1`, de modo que 0 apunta al primer fotograma y 1 al último.
 */
export function calcularFotograma(progreso: number, total: number): number {
  if (!Number.isInteger(total) || total <= 0) return 0;
  return limitarProgreso(progreso) * (total - 1);
}

/**
 * Interpolación lineal amortiguada de `actual` hacia `objetivo`. El `factor`
 * se restringe a 0..1: con 0 no avanza y con 1 salta directo al objetivo.
 * Sirve para suavizar el scrubbing y absorber los saltos del scroll.
 */
export function interpolar(
  actual: number,
  objetivo: number,
  factor: number,
): number {
  if (!Number.isFinite(objetivo)) return 0;
  if (!Number.isFinite(actual)) return objetivo;
  return actual + (objetivo - actual) * limitarProgreso(factor);
}
