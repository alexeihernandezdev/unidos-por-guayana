import type { Aporte } from "@/modules/aportes/domain/Aporte";
import { EstadoAporte } from "@/modules/aportes/domain/EstadoAporte";
import {
  esAporteMonetario,
  montoValido,
  normalizarNota,
  normalizarReferencia,
} from "@/modules/aportes/domain/reglas";
import { esMonedaPermitida } from "@/modules/donaciones/domain/Moneda";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { ActividadNoEncontradaError } from "@/modules/actividades/application/errors";
import type { Actor, AporteDeps } from "./deps";
import {
  MontoInvalidoError,
  NoAutorizadoError,
  RecursoFueraDeMetasError,
  RecursoNoMonetarioError,
} from "./errors";

export type RegistrarAporteExternoInput = {
  recursoId: string;
  monto: number;
  moneda: string;
  fechaRecepcion: Date;
  // Todos opcionales: un ingreso puede ser anónimo (sin colaborador), de "caja
  // general" (sin ayuda) y sin medio/referencia registrados.
  medioDonacionId?: string | null;
  actividadId?: string | null;
  colaboradorId?: string | null;
  referencia?: string | null;
  nota?: string | null;
};

/**
 * Registra un ingreso monetario ya recibido por fuera de la app (feature 014).
 * NO procesa ningún pago: solo deja constancia de dinero que YA entró.
 *
 * Reglas:
 * 1. Solo un `ADMIN` puede imputar un ingreso externo.
 * 2. El recurso debe existir y ser de categoría `MONETARIO`.
 * 3. `monto > 0` y `moneda` dentro del conjunto permitido.
 * 4. Si se ata a una `ayudaId`, la actividad debe existir y tener una meta para
 *    ese recurso (así el ingreso suma a su progreso). Sin `ayudaId` es "caja
 *    general" y cuenta en el agregado global.
 *
 * El aporte nace directamente en `RECIBIDO` (el dinero ya está); no pasa por
 * `COMPROMETIDO`. `registradoPorId` guarda al ADMIN para auditoría.
 */
export async function registrarAporteExterno(
  { aportes, actividades, recursos }: AporteDeps,
  input: RegistrarAporteExternoInput,
  actor: Actor,
): Promise<Aporte> {
  if (actor.rol !== Rol.ADMIN) {
    throw new NoAutorizadoError(
      "Solo un ADMIN puede registrar ingresos monetarios externos.",
    );
  }

  const recurso = await recursos.buscarPorId(input.recursoId);
  if (!recurso) {
    throw new RecursoNoMonetarioError("El recurso indicado no existe.");
  }
  if (!esAporteMonetario(recurso.categoria)) {
    throw new RecursoNoMonetarioError(
      `El recurso "${recurso.nombre}" no es de categoría MONETARIO.`,
    );
  }

  if (!montoValido(input.monto)) {
    throw new MontoInvalidoError("El monto debe ser mayor que cero.");
  }

  const moneda = input.moneda.trim();
  if (!esMonedaPermitida(moneda)) {
    throw new MontoInvalidoError("La moneda no es válida.");
  }

  const actividadId = input.actividadId ?? null;
  if (actividadId) {
    const ayuda = await actividades.buscarPorId(actividadId);
    if (!ayuda) throw new ActividadNoEncontradaError(actividadId);
    const tieneMeta = ayuda.metas.some((m) => m.recursoId === input.recursoId);
    if (!tieneMeta) {
      throw new RecursoFueraDeMetasError(
        "La actividad no tiene una meta para ese recurso monetario.",
      );
    }
  }

  return aportes.crear({
    actividadId,
    recursoId: input.recursoId,
    colaboradorId: input.colaboradorId ?? null,
    cantidad: input.monto,
    moneda,
    estado: EstadoAporte.RECIBIDO,
    registradoPorId: actor.id,
    medioDonacionId: input.medioDonacionId ?? null,
    referencia: normalizarReferencia(input.referencia),
    nota: normalizarNota(input.nota),
    recibidoEn: input.fechaRecepcion,
  });
}
