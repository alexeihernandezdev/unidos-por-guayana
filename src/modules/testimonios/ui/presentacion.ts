import { EstadoTestimonio } from "../domain/EstadoTestimonio";

export const ESTADO_TESTIMONIO_LABEL: Record<EstadoTestimonio, string> = {
  [EstadoTestimonio.PENDIENTE]: "Pendiente",
  [EstadoTestimonio.APROBADO]: "Publicado",
  [EstadoTestimonio.RECHAZADO]: "Rechazado",
  [EstadoTestimonio.OCULTO]: "Oculto",
};

export const ESTADO_TESTIMONIO_CLASE: Record<EstadoTestimonio, string> = {
  [EstadoTestimonio.PENDIENTE]: "border-warning/35 bg-warning/10 text-warning-ink",
  [EstadoTestimonio.APROBADO]: "border-success/35 bg-success/10 text-success-ink",
  [EstadoTestimonio.RECHAZADO]: "border-destructive/30 bg-destructive/10 text-destructive",
  [EstadoTestimonio.OCULTO]: "border-border bg-muted text-muted-foreground",
};

export function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}
