import type { ActividadRepository } from "@/modules/actividades/domain/ActividadRepository";
import type { RecursoRepository } from "@/modules/recursos/domain/RecursoRepository";
import type { AporteRepository } from "@/modules/aportes/domain/AporteRepository";
import type { Rol } from "@/modules/usuarios/domain/Rol";

// Dependencias que inyectan los casos de uso de aportes. La capa se mantiene pura
// porque solo recibe contratos de dominio (features 004/005/006).
export type AporteDeps = {
  aportes: AporteRepository;
  actividades: ActividadRepository;
  recursos: RecursoRepository;
};

// Actor que ejecuta el caso de uso: id del usuario y su rol. Los casos de uso lo
// usan para decidir autorización (dueño vs ADMIN, etc.). La presentación arma este
// objeto a partir de la sesión (feature 002) antes de invocar el caso de uso.
export type Actor = {
  id: string;
  rol: Rol;
};
