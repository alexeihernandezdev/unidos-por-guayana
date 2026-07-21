import {
  aprobarTestimonio,
  contarTestimoniosPublicos,
  crearTestimonio,
  destacarTestimonio,
  editarTestimonio,
  eliminarTestimonio,
  listarTestimoniosDeAutor,
  listarTestimoniosParaModerar,
  listarTestimoniosPublicos,
  ocultarTestimonio,
  quitarDestacadoTestimonio,
  rechazarTestimonio,
  retirarTestimonio,
  type ActorTestimonio,
  type GuardarTestimonioInput,
} from "@/modules/testimonios/application";
import type {
  EstadoTestimonio,
  FiltroTestimonios,
  Testimonio,
} from "@/modules/testimonios/domain";
import { PrismaTestimonioRepository } from "@/modules/testimonios/infrastructure/PrismaTestimonioRepository";
import { PrismaSolicitudRepository } from "@/modules/solicitudes/infrastructure/PrismaSolicitudRepository";

const testimonios = new PrismaTestimonioRepository();
const solicitudes = new PrismaSolicitudRepository();
const deps = { testimonios, solicitudes };

export function crearTestimonioServicio(
  input: GuardarTestimonioInput,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return crearTestimonio(deps, input, actor);
}

export function editarTestimonioServicio(
  id: string,
  input: GuardarTestimonioInput,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return editarTestimonio(deps, id, input, actor);
}

export function retirarTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return retirarTestimonio(deps, id, actor);
}

export function eliminarTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<void> {
  return eliminarTestimonio(deps, id, actor);
}

export function aprobarTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return aprobarTestimonio(deps, id, actor);
}

export function rechazarTestimonioServicio(
  id: string,
  motivo: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return rechazarTestimonio(deps, id, motivo, actor);
}

export function ocultarTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return ocultarTestimonio(deps, id, actor);
}

export function destacarTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return destacarTestimonio(deps, id, actor);
}

export function quitarDestacadoTestimonioServicio(
  id: string,
  actor: ActorTestimonio,
): Promise<Testimonio> {
  return quitarDestacadoTestimonio(deps, id, actor);
}

export function listarTestimoniosDeAutorServicio(
  autorId: string,
): Promise<Testimonio[]> {
  return listarTestimoniosDeAutor(deps, autorId);
}

export function listarTestimoniosPublicosServicio(
  filtro: Pick<FiltroTestimonios, "destacados" | "skip" | "take"> = {},
): Promise<Testimonio[]> {
  return listarTestimoniosPublicos(deps, filtro);
}

export function contarTestimoniosPublicosServicio(): Promise<number> {
  return contarTestimoniosPublicos(deps);
}

export function listarTestimoniosParaModerarServicio(filtro: {
  estado?: EstadoTestimonio;
  texto?: string;
}): Promise<Testimonio[]> {
  return listarTestimoniosParaModerar(deps, filtro);
}
