import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { ActividadDeps } from "@/modules/actividades/application/deps";
import type { SolicitudDeps } from "@/modules/solicitudes/application/deps";

export type PanelDeps = ActividadDeps & AporteDeps & SolicitudDeps;
