import type { Metadata } from "next";
import { ScanSearch } from "lucide-react";
import { GestionAuditores } from "@/modules/usuarios/ui/GestionAuditores";
import { Rol } from "@/modules/usuarios/domain/Rol";
import { listarAuditoresGestion, requireRol } from "@/shared/auth";
import { PanelPage, PanelPageHeader } from "@/shared/ui/panel";
import {
  crearAuditorAction,
  reactivarAuditorAction,
  suspenderAuditorAction,
} from "./actions";

export const metadata: Metadata = {
  title: "Equipo de auditoría | Unidos por Guayana",
};

export default async function AuditoresPage() {
  const actor = await requireRol(Rol.SUPERADMIN);
  const auditores = await listarAuditoresGestion({ rol: actor.rol });

  return (
    <PanelPage>
      <PanelPageHeader
        icon={ScanSearch}
        eyebrow="Control de acceso"
        title="Equipo de auditoría"
        description="Crea y administra las cuentas responsables de validar externamente cada solicitud."
      />
      <GestionAuditores
        auditores={auditores}
        crearAction={crearAuditorAction}
        suspenderAction={suspenderAuditorAction}
        reactivarAction={reactivarAuditorAction}
      />
    </PanelPage>
  );
}
