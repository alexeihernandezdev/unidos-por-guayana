import type { SolicitudRepository } from "@/modules/solicitudes/domain/SolicitudRepository";
import type { Rol } from "@/modules/usuarios/domain/Rol";
import type { TestimonioRepository } from "../domain/TestimonioRepository";

export type TestimonioDeps = {
  testimonios: TestimonioRepository;
  solicitudes: Pick<SolicitudRepository, "buscarPorId">;
};

export type ActorTestimonio = {
  id: string;
  rol: Rol;
};
