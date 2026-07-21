import { Rol } from "@/modules/usuarios/domain/Rol";
import {
  EstadoTestimonio,
  LIMITES_TESTIMONIO,
  puedeEditar,
  validarContenido,
  type CambiosTestimonio,
  type FiltroTestimonios,
  type Testimonio,
} from "../domain";
import type { ActorTestimonio, TestimonioDeps } from "./deps";
import {
  DatosTestimonioInvalidosError,
  LimiteDestacadosError,
  SolicitudTestimonioInvalidaError,
  TestimonioNoAutorizadoError,
  TestimonioNoEditableError,
  TestimonioNoEncontradoError,
  TransicionTestimonioInvalidaError,
} from "./errors";

export type GuardarTestimonioInput = {
  titulo: string;
  contenido: string;
  solicitudId?: string | null;
};

function exigirAutorValido(actor: ActorTestimonio): void {
  if (actor.rol !== Rol.COLABORADOR && actor.rol !== Rol.SOLICITANTE) {
    throw new TestimonioNoAutorizadoError("Tu rol no puede publicar testimonios.");
  }
}

function exigirAdmin(actor: ActorTestimonio): void {
  if (actor.rol !== Rol.ADMIN) {
    throw new TestimonioNoAutorizadoError("Solo un administrador puede moderar testimonios.");
  }
}

async function validarSolicitud(
  deps: TestimonioDeps,
  solicitudId: string | null,
  actor: ActorTestimonio,
): Promise<void> {
  if (!solicitudId) return;
  if (actor.rol !== Rol.SOLICITANTE) {
    throw new SolicitudTestimonioInvalidaError(
      "Solo un solicitante puede vincular una solicitud propia.",
    );
  }
  const solicitud = await deps.solicitudes.buscarPorId(solicitudId);
  if (!solicitud || solicitud.solicitanteId !== actor.id) {
    throw new SolicitudTestimonioInvalidaError(
      "La solicitud seleccionada no te pertenece.",
    );
  }
}

function validarDatos(input: GuardarTestimonioInput): CambiosTestimonio {
  try {
    validarContenido(input.titulo, input.contenido);
  } catch (error) {
    throw new DatosTestimonioInvalidosError(
      error instanceof Error ? error.message : "Datos del testimonio no válidos.",
    );
  }
  return {
    titulo: input.titulo.trim(),
    contenido: input.contenido.trim(),
    solicitudId: input.solicitudId?.trim() || null,
  };
}

async function requerir(
  deps: TestimonioDeps,
  id: string,
): Promise<Testimonio> {
  const testimonio = await deps.testimonios.buscarPorId(id);
  if (!testimonio) throw new TestimonioNoEncontradoError("El testimonio no existe.");
  return testimonio;
}

export async function crearTestimonio(
  deps: TestimonioDeps,
  input: GuardarTestimonioInput,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAutorValido(actor);
  const datos = validarDatos(input);
  await validarSolicitud(deps, datos.solicitudId, actor);
  return deps.testimonios.crear({ autorId: actor.id, ...datos });
}

export async function editarTestimonio(
  deps: TestimonioDeps,
  id: string,
  input: GuardarTestimonioInput,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAutorValido(actor);
  const actual = await requerir(deps, id);
  if (actual.autorId !== actor.id) {
    throw new TestimonioNoAutorizadoError("No puedes editar este testimonio.");
  }
  if (!puedeEditar(actual)) {
    throw new TestimonioNoEditableError(
      "Un testimonio publicado u oculto no se puede editar.",
    );
  }
  const cambios = validarDatos(input);
  await validarSolicitud(deps, cambios.solicitudId, actor);
  return deps.testimonios.editar(id, cambios);
}

export async function retirarTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  const actual = await requerir(deps, id);
  if (actual.autorId !== actor.id) {
    throw new TestimonioNoAutorizadoError("No puedes retirar este testimonio.");
  }
  return deps.testimonios.retirar(id);
}

export async function eliminarTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<void> {
  const actual = await requerir(deps, id);
  if (actual.autorId !== actor.id) {
    throw new TestimonioNoAutorizadoError("No puedes eliminar este testimonio.");
  }
  await deps.testimonios.eliminar(id);
}

export async function aprobarTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAdmin(actor);
  const actual = await requerir(deps, id);
  if (actual.estado !== EstadoTestimonio.PENDIENTE) {
    throw new TransicionTestimonioInvalidaError(
      "Solo se puede aprobar un testimonio pendiente.",
    );
  }
  return deps.testimonios.moderar(id, EstadoTestimonio.APROBADO, actor.id);
}

export async function rechazarTestimonio(
  deps: TestimonioDeps,
  id: string,
  motivo: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAdmin(actor);
  const actual = await requerir(deps, id);
  const limpio = motivo.trim();
  if (actual.estado !== EstadoTestimonio.PENDIENTE) {
    throw new TransicionTestimonioInvalidaError(
      "Solo se puede rechazar un testimonio pendiente.",
    );
  }
  if (
    limpio.length < LIMITES_TESTIMONIO.MOTIVO_MIN ||
    limpio.length > LIMITES_TESTIMONIO.MOTIVO_MAX
  ) {
    throw new DatosTestimonioInvalidosError(
      "El motivo debe tener entre 10 y 300 caracteres.",
    );
  }
  return deps.testimonios.moderar(
    id,
    EstadoTestimonio.RECHAZADO,
    actor.id,
    limpio,
  );
}

export async function ocultarTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAdmin(actor);
  const actual = await requerir(deps, id);
  if (actual.estado !== EstadoTestimonio.APROBADO) {
    throw new TransicionTestimonioInvalidaError(
      "Solo se puede ocultar un testimonio publicado.",
    );
  }
  return deps.testimonios.moderar(id, EstadoTestimonio.OCULTO, actor.id);
}

export async function destacarTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAdmin(actor);
  const actual = await requerir(deps, id);
  if (actual.estado !== EstadoTestimonio.APROBADO) {
    throw new TransicionTestimonioInvalidaError(
      "Solo se puede destacar un testimonio publicado.",
    );
  }
  const resultado = await deps.testimonios.destacarSiHayCupo(
    id,
    LIMITES_TESTIMONIO.DESTACADOS_MAX,
  );
  if (!resultado) {
    throw new LimiteDestacadosError(
      "Ya hay 6 testimonios destacados. Quita uno antes de continuar.",
    );
  }
  return resultado;
}

export async function quitarDestacadoTestimonio(
  deps: TestimonioDeps,
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  exigirAdmin(actor);
  await requerir(deps, id);
  return deps.testimonios.quitarDestacado(id);
}

export function listarTestimoniosPublicos(
  deps: TestimonioDeps,
  filtro: Pick<FiltroTestimonios, "destacados" | "skip" | "take"> = {},
): Promise<Testimonio[]> {
  return deps.testimonios.listar({
    ...filtro,
    estado: EstadoTestimonio.APROBADO,
  });
}

export function contarTestimoniosPublicos(deps: TestimonioDeps): Promise<number> {
  return deps.testimonios.contar({ estado: EstadoTestimonio.APROBADO });
}

export function listarTestimoniosDeAutor(
  deps: TestimonioDeps,
  autorId: string,
): Promise<Testimonio[]> {
  return deps.testimonios.listar({ autorId });
}

export function listarTestimoniosParaModerar(
  deps: TestimonioDeps,
  filtro: Pick<FiltroTestimonios, "estado" | "texto"> = {},
): Promise<Testimonio[]> {
  return deps.testimonios.listar(filtro);
}
