import type { MedioDonacionRepository } from "@/modules/donaciones/domain/MedioDonacionRepository";

// Dependencias que inyectan los casos de uso de donaciones. La capa se mantiene
// pura porque solo recibe contratos de dominio (feature 014).
export type MedioDonacionDeps = {
  medios: MedioDonacionRepository;
};
