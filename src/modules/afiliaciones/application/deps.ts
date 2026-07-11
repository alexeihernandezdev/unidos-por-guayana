import type { AfiliacionRepository } from "@/modules/afiliaciones/domain/AfiliacionRepository";
import type { LectorCentrosDisponibles } from "@/modules/afiliaciones/domain/LectorCentrosDisponibles";

// Dependencias de los casos de uso de afiliaciones. `centros` (lectura de centros
// verificados con sus puntos) solo lo usan el descubrimiento y `/mi-perfil`; es
// opcional para el resto. Todas son contratos de dominio: la capa se mantiene pura.
export type AfiliacionDeps = {
  afiliaciones: AfiliacionRepository;
  centros?: LectorCentrosDisponibles;
};
