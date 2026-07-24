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

// ── Teléfono (E.164 con selector de país, feature 012) ──────────────────────────

// Lista curada de países soportados en el selector de teléfono: Venezuela (por
// defecto) más los destinos típicos de la diáspora. `dialCode` es el código de
// marcación sin `+`. Se mantiene a mano (sin dependencias); ampliarla es añadir
// una fila. El teléfono se guarda en E.164 (`+<dialCode><numeroNacional>`), y el
// canal de WhatsApp (feature 012) lo consume tal cual.
export type PaisTelefono = {
  iso: string;
  nombre: string;
  dialCode: string;
  ejemplo: string;
};

export const PAISES_TELEFONO: readonly PaisTelefono[] = [
  { iso: "VE", nombre: "Venezuela", dialCode: "58", ejemplo: "0412 1234567" },
  { iso: "US", nombre: "Estados Unidos", dialCode: "1", ejemplo: "555 123 4567" },
  { iso: "ES", nombre: "España", dialCode: "34", ejemplo: "612 345 678" },
  { iso: "CO", nombre: "Colombia", dialCode: "57", ejemplo: "300 1234567" },
  { iso: "CL", nombre: "Chile", dialCode: "56", ejemplo: "9 1234 5678" },
  { iso: "PE", nombre: "Perú", dialCode: "51", ejemplo: "912 345 678" },
  { iso: "AR", nombre: "Argentina", dialCode: "54", ejemplo: "11 1234 5678" },
  { iso: "PA", nombre: "Panamá", dialCode: "507", ejemplo: "6123 4567" },
  { iso: "MX", nombre: "México", dialCode: "52", ejemplo: "55 1234 5678" },
  { iso: "BR", nombre: "Brasil", dialCode: "55", ejemplo: "11 91234 5678" },
  { iso: "EC", nombre: "Ecuador", dialCode: "593", ejemplo: "99 123 4567" },
] as const;

export const PAIS_TELEFONO_DEFECTO = "VE";

// Países ordenados por longitud de `dialCode` (desc) para que el emparejamiento por
// prefijo de un E.164 elija el código más largo primero (p. ej. `593` antes que `59`).
const PAISES_POR_PREFIJO = [...PAISES_TELEFONO].sort(
  (a, b) => b.dialCode.length - a.dialCode.length,
);

function paisPorIso(iso: string): PaisTelefono | undefined {
  return PAISES_TELEFONO.find((p) => p.iso === iso);
}

// Valida el número nacional venezolano (10 dígitos significativos, sin el 0
// inicial) contra los códigos de operadora/área conocidos. Devuelve el error o
// `null` si es válido.
function errorNacionalVenezuela(nacional10: string): string | null {
  if (nacional10.length !== 10) {
    return "El teléfono debe tener 11 dígitos (por ejemplo 0412 1234567).";
  }
  const codigo = `0${nacional10.slice(0, 3)}`;
  if (!(CODIGOS_OPERADORA_VENEZUELA as readonly string[]).includes(codigo)) {
    return "El código de operadora no es válido en Venezuela.";
  }
  return null;
}

/**
 * Valida y normaliza un teléfono a **E.164** (`+<dialCode><numeroNacional>`). El
 * `iso` indica el país elegido en el formulario (por defecto Venezuela). Acepta:
 * - un E.164 ya compuesto (`+58412...`), del que deduce el país por el prefijo;
 * - un número nacional venezolano (`0412...`, con o sin separadores) cuando el
 *   país es Venezuela (compatibilidad con lo capturado antes de esta feature).
 *
 * Venezuela conserva la validación estricta de operadora; el resto de países
 * validan por longitud E.164 (7 a 15 dígitos en total tras el `+`).
 */
export function validarTelefono(
  entrada: string,
  iso: string = PAIS_TELEFONO_DEFECTO,
): ResultadoValidacion<string> {
  const bruta = entrada.trim();
  if (bruta.length === 0) {
    return { ok: false, error: "El teléfono es obligatorio." };
  }

  // Un `00` internacional se trata como `+`.
  const conMas = bruta.startsWith("00") ? `+${bruta.slice(2)}` : bruta;

  // Caso 1: E.164 explícito (empieza por `+`). El país se deduce del prefijo.
  if (conMas.startsWith("+")) {
    const digitos = conMas.slice(1).replace(/\D/g, "");
    const pais = PAISES_POR_PREFIJO.find((p) => digitos.startsWith(p.dialCode));
    if (!pais) {
      return { ok: false, error: "El código de país no es reconocido." };
    }
    const nacional = digitos.slice(pais.dialCode.length);
    if (pais.iso === "VE") {
      const error = errorNacionalVenezuela(nacional);
      if (error) return { ok: false, error };
      return { ok: true, valor: `+58${nacional}` };
    }
    if (nacional.length < 6 || nacional.length > 14) {
      return { ok: false, error: "El número de teléfono no es válido." };
    }
    return { ok: true, valor: `+${pais.dialCode}${nacional}` };
  }

  // Caso 2: número sin prefijo. Se interpreta según el país elegido.
  const pais = paisPorIso(iso) ?? paisPorIso(PAIS_TELEFONO_DEFECTO)!;
  const soloDigitos = conMas.replace(/\D/g, "");

  if (pais.iso === "VE") {
    // Acepta `0XXXXXXXXXX` (11) o `XXXXXXXXXX` (10, sin el 0). También `58...`.
    let nacional = soloDigitos;
    if (nacional.startsWith("58") && nacional.length === 12) {
      nacional = nacional.slice(2);
    } else if (nacional.startsWith("0")) {
      nacional = nacional.slice(1);
    }
    const error = errorNacionalVenezuela(nacional);
    if (error) return { ok: false, error };
    return { ok: true, valor: `+58${nacional}` };
  }

  if (soloDigitos.length < 6 || soloDigitos.length > 14) {
    return { ok: false, error: "El número de teléfono no es válido." };
  }
  return { ok: true, valor: `+${pais.dialCode}${soloDigitos}` };
}

export function normalizarTelefono(
  entrada: string,
  iso: string = PAIS_TELEFONO_DEFECTO,
): string | null {
  const resultado = validarTelefono(entrada, iso);
  return resultado.ok ? resultado.valor : null;
}

/** Deduce el `iso` del país de un teléfono E.164 por su prefijo, o `null`. */
export function paisDeTelefonoE164(telefono: string): string | null {
  if (!telefono.startsWith("+")) return null;
  const digitos = telefono.slice(1).replace(/\D/g, "");
  const pais = PAISES_POR_PREFIJO.find((p) => digitos.startsWith(p.dialCode));
  return pais?.iso ?? null;
}

/**
 * Descompone un teléfono E.164 en el país (`iso`) y el número **para mostrar** en
 * el input al editar: en Venezuela se antepone el `0` nacional (`0412...`); en el
 * resto se devuelve el número significativo tal cual. Si no se reconoce el
 * prefijo, cae a Venezuela con el número entre los dígitos disponibles.
 */
export function partesTelefonoE164(telefono: string): {
  iso: string;
  nacional: string;
} {
  const iso = paisDeTelefonoE164(telefono) ?? PAIS_TELEFONO_DEFECTO;
  const pais = paisPorIso(iso)!;
  const digitos = telefono.replace(/\D/g, "");
  const nacional = digitos.startsWith(pais.dialCode)
    ? digitos.slice(pais.dialCode.length)
    : digitos;
  return { iso, nacional: iso === "VE" ? `0${nacional}` : nacional };
}

// ── Ubicación (catálogo, feature 020) ─────────────────────────────────────────

// La ubicación ya no es texto libre: son dos identificadores del catálogo
// (`estadoId`, `municipioId`). Aquí solo se comprueba su **presencia**; la
// coherencia estado↔municipio (existencia y pertenencia) la valida el dominio de
// `ubicacion` (`validarUbicacion`) contra el catálogo, en el caso de uso.
export type SeleccionUbicacion = {
  estadoId: string;
  municipioId: string;
};

/** Comprueba que se haya elegido estado y municipio (no vacíos tras trim). */
export function validarSeleccionUbicacion(
  entrada: SeleccionUbicacion,
): ResultadoValidacion<SeleccionUbicacion> {
  const estadoId = entrada.estadoId?.trim() ?? "";
  const municipioId = entrada.municipioId?.trim() ?? "";

  if (estadoId.length === 0) {
    return { ok: false, error: "Selecciona el estado." };
  }
  if (municipioId.length === 0) {
    return { ok: false, error: "Selecciona el municipio." };
  }

  return { ok: true, valor: { estadoId, municipioId } };
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
 * Valida y normaliza los datos de contacto. Comprueba cédula y teléfono (formato)
 * y la **presencia** de estado/municipio; la coherencia estado↔municipio contra
 * el catálogo se valida aparte en el caso de uso (necesita consultar el catálogo).
 * Devuelve el primer error encontrado, en el orden en que se ven en el formulario.
 */
export function validarDatosContacto(
  entrada: DatosContacto,
): ResultadoValidacion<DatosContacto> {
  const cedula = validarCedula(entrada.cedula);
  if (!cedula.ok) return cedula;

  const telefono = validarTelefono(entrada.telefono);
  if (!telefono.ok) return telefono;

  const ubicacion = validarSeleccionUbicacion({
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
 * a `/completar-perfil` mientras falte cualquiera de los cuatro campos
 * (feature 020: la ubicación se comprueba por `estadoId` y `municipioId`).
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
