import type { AporteDeps } from "@/modules/aportes/application/deps";
import type { AyudaDeps } from "@/modules/ayudas/application/deps";
import type { SolicitudDeps } from "@/modules/solicitudes/application/deps";

export type PanelDeps = AyudaDeps & AporteDeps & SolicitudDeps;
