// Reglas de contacto y ubicación exigidas a `COLABORADOR` y `SOLICITANTE`
// (feature 017). Dominio puro: sin Prisma, sin framework. Las funciones devuelven
// el valor normalizado listo para persistir o un error tipado con el mensaje que
// verá el usuario en español. Las consumen tanto el formulario (resolver) como
// el servidor (caso de uso), para tener una sola fuente de verdad.

export const PREFIJOS_CEDULA = ["V", "E", "J"] as const;
export type PrefijoCedula = (typeof PREFIJOS_CEDULA)[number];

// Códigos de operadora/área válidos en Venezuela. Móviles y una selección de
// fijos por código de área (los más comunes). La lista se puede ampliar sin
// tocar la validación.
export const CODIGOS_OPERADORA_VENEZUELA = [
  // Móviles.
  "0412",
  "0414",
  "0416",
  "0424",
  "0426",
  // Fijos por código de área (selección).
  "0212",
  "0234",
  "0235",
  "0238",
  "0239",
  "0240",
  "0241",
  "0242",
  "0243",
  "0244",
  "0245",
  "0246",
  "0247",
  "0248",
  "0249",
  "0251",
  "0252",
  "0253",
  "0254",
  "0255",
  "0256",
  "0257",
  "0258",
  "0259",
  "0261",
  "0262",
  "0263",
  "0264",
  "0265",
  "0266",
  "0267",
  "0268",
  "0269",
  "0271",
  "0272",
  "0273",
  "0274",
  "0275",
  "0276",
  "0277",
  "0278",
  "0279",
  "0281",
  "0282",
  "0283",
  "0284",
  "0285",
  "0286",
  "0287",
  "0288",
  "0289",
  "0291",
  "0292",
  "0293",
  "0294",
  "0295",
  "0296",
] as const;

export type ResultadoValidacion<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

// ── Cédula ────────────────────────────────────────────────────────────────────

/**
 * Valida y normaliza una cédula venezolana. Acepta prefijo V/E/J (mayúscula o
 * minúscula, con o sin guion/espacio) seguido del número (con o sin puntos).
 * Devuelve `V12345678` (prefijo en mayúscula + solo dígitos) si es válida.
 */
export function validarCedula(entrada: string): ResultadoValidacion<string> {
  const bruta = entrada.trim();
  if (bruta.length === 0) {
    return { ok: false, error: "La cédula es obligatoria." };
  }

  const match = bruta.match(/^([a-zA-Z])\s*-?\s*([\d.\s]+)$/);
  if (!match) {
    return { ok: false, error: "La cédula debe empezar por V, E o J." };
  }

  const prefijo = match[1].toUpperCase();
  if (!(PREFIJOS_CEDULA as readonly string[]).includes(prefijo)) {
    return { ok: false, error: "La cédula debe empezar por V, E o J." };
  }

  const digitos = match[2].replace(/[^\d]/g, "");
  if (digitos.length < 6 || digitos.length > 9) {
    return {
      ok: false,
      error: "La cédula debe tener entre 6 y 9 dígitos.",
    };
  }

  return { ok: true, valor: `${prefijo}${digitos}` };
}

/**
 * Devuelve la cédula normalizada o `null` si la entrada no es válida. Útil
 * cuando ya sabes que el valor pasó por `validarCedula` (p. ej. en tests o al
 * componer con otras reglas).
 */
export function normalizarCedula(entrada: string): string | null {
  const resultado = validarCedula(entrada);
  return resultado.ok ? resultado.valor : null;
}

// ── Teléfono ──────────────────────────────────────────────────────────────────

/**
 * Valida y normaliza un teléfono venezolano. Acepta separadores (espacios,
 * guiones, paréntesis) y prefijo internacional opcional `+58`. Devuelve el
 * número en formato nacional `0XXXXXXXXXX` (11 dígitos).
 */
export function validarTelefono(entrada: string): ResultadoValidacion<string> {
  const bruta = entrada.trim();
  if (bruta.length === 0) {
    return { ok: false, error: "El teléfono es obligatorio." };
  }

  // Normaliza: descarta todo lo que no sea dígito; si empieza por +58, lo
  // convierte a 0.
  let digitos = bruta.replace(/[^\d+]/g, "");
  if (digitos.startsWith("+58")) {
    digitos = `0${digitos.slice(3)}`;
  } else {
    digitos = digitos.replace(/\+/g, "");
  }

  if (digitos.length !== 11 || !digitos.startsWith("0")) {
    return {
      ok: false,
      error: "El teléfono debe tener 11 dígitos (por ejemplo 0412 1234567).",
    };
  }

  const codigo = digitos.slice(0, 4);
  if (!(CODIGOS_OPERADORA_VENEZUELA as readonly string[]).includes(codigo)) {
    return {
      ok: false,
      error: "El código de operadora no es válido en Venezuela.",
    };
  }

  return { ok: true, valor: digitos };
}

export function normalizarTelefono(entrada: string): string | null {
  const resultado = validarTelefono(entrada);
  return resultado.ok ? resultado.valor : null;
}

// ── Ubicación (catálogo 020) ──────────────────────────────────────────────────

export type Ubicacion = {
  estadoId: string;
  municipioId: string;
};

/**
 * Valida que `estadoId` y `municipioId` no estén vacíos. La pertenencia
 * municipio↔estado la comprueba `validarUbicacionCatalogo` (módulo ubicaciones)
 * en el caso de uso, con acceso al repositorio.
 */
export function validarUbicacion(
  entrada: Ubicacion,
): ResultadoValidacion<Ubicacion> {
  const estadoId = entrada.estadoId.trim();
  const municipioId = entrada.municipioId.trim();

  if (estadoId.length === 0) {
    return { ok: false, error: "Selecciona el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Selecciona el municipio." };
  }

  return { ok: true, valor: { estadoId, municipioId } };
}

export function normalizarUbicacion(entrada: Ubicacion): Ubicacion | null {
  const resultado = validarUbicacion(entrada);
  return resultado.ok ? resultado.valor : null;
}

// ── Datos de contacto completos ───────────────────────────────────────────────

export type DatosContacto = {
  cedula: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  estadoId: string;
  municipioId: string;
};

/**
 * Valida y normaliza cédula, teléfono y IDs de ubicación (no vacíos). La
 * pertenencia al catálogo se valida en el caso de uso con el repositorio.
 */
export function validarDatosContacto(
  entrada: DatosContacto,
): ResultadoValidacion<DatosContacto> {
  const cedula = validarCedula(entrada.cedula);
  if (!cedula.ok) return cedula;

  const telefono = validarTelefono(entrada.telefono);
  if (!telefono.ok) return telefono;

  const ubicacion = validarUbicacion({
    estadoId: entrada.estadoId,
    municipioId: entrada.municipioId,
  });
  if (!ubicacion.ok) return ubicacion;

  return {
    ok: true,
    valor: {
      cedula: cedula.valor,
      telefono: telefono.valor,
      telefonoEsWhatsApp: Boolean(entrada.telefonoEsWhatsApp),
      estadoId: ubicacion.valor.estadoId,
      municipioId: ubicacion.valor.municipioId,
    },
  };
}

/**
 * Devuelve `true` si un usuario `COLABORADOR`/`SOLICITANTE` tiene todos los
 * datos obligatorios completos. Lo consume el guard de servidor para redirigir
 * a `/completar-perfil` mientras falte cualquiera de los campos.
 */
export function tieneDatosContactoCompletos(datos: {
  cedula: string | null;
  telefono: string | null;
  estadoId: string | null;
  municipioId: string | null;
}): boolean {
  return (
    Boolean(datos.cedula) &&
    Boolean(datos.telefono) &&
    Boolean(datos.estadoId) &&
    Boolean(datos.municipioId)
  );
}
