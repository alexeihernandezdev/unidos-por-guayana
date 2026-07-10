-- Feature 017: datos de contacto obligatorios (colaborador y solicitante).
-- Añade cinco columnas a `usuarios` (cédula, teléfono, flag WhatsApp, estado,
-- parroquia). Las cuatro de texto son opcionales en base para no romper filas
-- existentes; el flujo las exige por el guard de servidor y el caso de uso.
-- También añade `telefonoEsWhatsApp` a `perfiles_admin` (enmienda 016) por
-- simetría de contacto.

-- AlterTable
ALTER TABLE "usuarios"
    ADD COLUMN "cedula" TEXT,
    ADD COLUMN "telefono" TEXT,
    ADD COLUMN "telefonoEsWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "estado" TEXT,
    ADD COLUMN "parroquia" TEXT;

-- AlterTable
ALTER TABLE "perfiles_admin"
    ADD COLUMN "telefonoEsWhatsApp" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cedula_key" ON "usuarios"("cedula");
