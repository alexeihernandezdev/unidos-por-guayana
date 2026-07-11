import type { PuntoAcopio } from "./PuntoAcopio";

// Reglas de dominio puras del punto de acopio. Sin framework, sin Prisma, sin
// Leaflet.

export function normalizar(texto: string): string {
  return texto.trim();
}

export function esTextoNoVacio(texto: string): boolean {
  return normalizar(texto).length > 0;
}

// Latitud válida: número en [-90, 90]. Recibe string (Prisma serializa
// `Decimal` como string); acepta también el formato con coma (`10,5` en es-VE)
// convirtiéndolo internamente.
export function esCoordenadaLatitud(valor: string): boolean {
  const n = parsearCoordenada(valor);
  return n !== null && n >= -90 && n <= 90;
}

// Longitud válida: número en [-180, 180]. Ver `esCoordenadaLatitud`.
export function esCoordenadaLongitud(valor: string): boolean {
  const n = parsearCoordenada(valor);
  return n !== null && n >= -180 && n <= 180;
}

// Normaliza una coordenada a string con punto decimal (`10,500000` → `10.5`).
// Devuelve el string tal cual si no es parseable (la validación de rango se
// encarga de rechazarlo antes de persistir).
export function normalizarCoordenada(valor: string): string {
  const n = parsearCoordenada(valor);
  return n === null ? valor.trim() : String(n);
}

function parsearCoordenada(valor: string): number | null {
  const s = valor.trim().replace(",", ".");
  if (s.length === 0) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Comprueba que un punto pertenezca al `ADMIN` indicado. Regla clave del
 * enforcement por propiedad: los casos de uso la invocan antes de editar,
 * archivar o activar.
 */
export function perteneceA(
  punto: Pick<PuntoAcopio, "adminId">,
  adminId: string,
): boolean {
  return punto.adminId === adminId;
}

/**
 * Aplica la herencia de ubicación al crear un punto. Si `estadoId` o
 * `municipioId` vienen vacíos en la entrada, se toman los del `PerfilAdmin`
 * del administrador dueño. El resultado es el valor efectivo que se persiste
 * (no se referencia vivo al perfil: si el admin cambia su ubicación después,
 * el punto no se mueve).
 *
 * Devuelve `null` si tras la herencia sigue faltando alguno (perfil incompleto
 * y el formulario no lo cubrió) — el caso de uso lo traduce a error.
 */
export function aplicarHerenciaUbicacion(
  entrada: { estadoId: string; municipioId: string },
  ubicacionAdmin: { estadoId: string; municipioId: string } | null,
): { estadoId: string; municipioId: string } | null {
  const estadoId = normalizar(entrada.estadoId) || (ubicacionAdmin?.estadoId ?? "");
  const municipioId =
    normalizar(entrada.municipioId) || (ubicacionAdmin?.municipioId ?? "");

  if (estadoId.length === 0 || municipioId.length === 0) {
    return null;
  }
  return { estadoId, municipioId };
}
