CREATE TYPE "DestinoVerificacionTelefono" AS ENUM ('USUARIO', 'PERFIL_ADMIN');

ALTER TABLE "usuarios"
  ADD COLUMN "telefonoVerificadoEn" TIMESTAMP(3);

ALTER TABLE "perfiles_admin"
  ADD COLUMN "telefonoVerificadoEn" TIMESTAMP(3);

UPDATE "usuarios"
SET "telefonoVerificadoEn" = CURRENT_TIMESTAMP
WHERE "telefono" IS NOT NULL;

UPDATE "perfiles_admin"
SET "telefonoVerificadoEn" = CURRENT_TIMESTAMP;

CREATE TABLE "verificaciones_telefono" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "destino" "DestinoVerificacionTelefono" NOT NULL,
  "telefonoPendiente" TEXT NOT NULL,
  "codigoHash" TEXT NOT NULL,
  "expiraEn" TIMESTAMP(3) NOT NULL,
  "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
  "envios" INTEGER NOT NULL DEFAULT 1,
  "ultimoEnvioEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consumidoEn" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "verificaciones_telefono_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "verificaciones_telefono_usuarioId_destino_consumidoEn_idx"
  ON "verificaciones_telefono"("usuarioId", "destino", "consumidoEn");

CREATE INDEX "verificaciones_telefono_usuarioId_telefonoPendiente_createdAt_idx"
  ON "verificaciones_telefono"("usuarioId", "telefonoPendiente", "createdAt");

ALTER TABLE "verificaciones_telefono"
  ADD CONSTRAINT "verificaciones_telefono_usuarioId_fkey"
  FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
