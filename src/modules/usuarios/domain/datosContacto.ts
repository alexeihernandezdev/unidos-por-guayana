// Reglas de contacto y ubicación exigidas a `COLABORADOR` y `SOLICITANTE`
// (features 017 + 020). Dominio puro: sin Prisma, sin framework.

export const PREFIJOS_CEDULA = ["V", "E", "J"] as const;
export type PrefijoCedula = (typeof PREFIJOS_CEDULA)[number];

export const CODIGOS_OPERADORA_VENEZUELA = [
  "0412",
  "0414",
  "0416",
  "0424",
  "0426",
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

export function normalizarCedula(entrada: string): string | null {
  const resultado = validarCedula(entrada);
  return resultado.ok ? resultado.valor : null;
}

export function validarTelefono(entrada: string): ResultadoValidacion<string> {
  const bruta = entrada.trim();
  if (bruta.length === 0) {
    return { ok: false, error: "El teléfono es obligatorio." };
  }

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

// ── Ubicación (catálogo feature 020) ─────────────────────────────────────────

export type Ubicacion = {
  estadoId: string;
  municipioId: string;
};

/** Valida presencia de IDs (la pertenencia municipio↔estado la valida aplicación). */
export function validarUbicacion(
  entrada: Ubicacion,
): ResultadoValidacion<Ubicacion> {
  const estadoId = entrada.estadoId.trim();
  const municipioId = entrada.municipioId.trim();

  if (estadoId.length === 0) {
    return { ok: false, error: "Indica el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Indica el municipio." };
  }

  return { ok: true, valor: { estadoId, municipioId } };
}

export type DatosContacto = {
  cedula: string;
  telefono: string;
  telefonoEsWhatsApp: boolean;
  estadoId: string;
  municipioId: string;
};

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
