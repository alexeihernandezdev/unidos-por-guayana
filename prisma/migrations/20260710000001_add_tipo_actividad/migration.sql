-- Feature 018 · Tipos de actividad en Ayuda (enmienda de 005).
-- Añade el enum `TipoActividad` y la columna `tipo` en `ayudas`. Las filas
-- existentes quedan `ENVIO` por el DEFAULT (coherente con que 005 nació hablando
-- de "envíos").

-- CreateEnum
CREATE TYPE "TipoActividad" AS ENUM ('ENVIO', 'JORNADA', 'EVENTO_SOCIAL');

-- AlterTable (backfill implícito por el DEFAULT + NOT NULL)
ALTER TABLE "ayudas" ADD COLUMN "tipo" "TipoActividad" NOT NULL DEFAULT 'ENVIO';

-- CreateIndex
CREATE INDEX "ayudas_tipo_idx" ON "ayudas"("tipo");
