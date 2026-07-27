-- Feature 036: categorías ampliadas y preferencias por canal externo.
ALTER TYPE "TipoNotificacion" ADD VALUE 'NUEVO_APORTE';
ALTER TYPE "TipoNotificacion" ADD VALUE 'ESTADO_APORTE';
ALTER TYPE "TipoNotificacion" ADD VALUE 'NUEVA_AFILIACION';
ALTER TYPE "TipoNotificacion" ADD VALUE 'AFILIACION_REMOVIDA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'NUEVA_SOLICITUD_ZONA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'ESTADO_SOLICITUD';
ALTER TYPE "TipoNotificacion" ADD VALUE 'ACTUALIZACION_AUDITORIA';
ALTER TYPE "TipoNotificacion" ADD VALUE 'NUEVA_SOLICITUD_AUDITABLE';
ALTER TYPE "TipoNotificacion" ADD VALUE 'RESULTADO_PROPUESTA_RECURSO';
ALTER TYPE "TipoNotificacion" ADD VALUE 'RESULTADO_TESTIMONIO';
ALTER TYPE "TipoNotificacion" ADD VALUE 'NUEVO_ADMIN_PENDIENTE';
ALTER TYPE "TipoNotificacion" ADD VALUE 'ESTADO_CUENTA_ADMIN';

CREATE TABLE "preferencias_notificacion" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tipo" "TipoNotificacion" NOT NULL,
  "emailActivo" BOOLEAN NOT NULL DEFAULT true,
  "whatsappActivo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "preferencias_notificacion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "preferencias_notificacion_usuarioId_tipo_key"
  ON "preferencias_notificacion"("usuarioId", "tipo");
CREATE INDEX "preferencias_notificacion_usuarioId_idx"
  ON "preferencias_notificacion"("usuarioId");

ALTER TABLE "preferencias_notificacion"
  ADD CONSTRAINT "preferencias_notificacion_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
