-- Feature 012 · Notificaciones (in-app + WhatsApp) y teléfono en formato E.164.

-- Tipo de notificación (conjunto cerrado del alcance).
CREATE TYPE "TipoNotificacion" AS ENUM ('NUEVA_ACTIVIDAD', 'META_CUMPLIDA');

-- Aviso in-app dirigido a un usuario. La referencia se guarda como par
-- (referenciaTipo, referenciaId) para no acoplar la tabla a una FK rígida.
CREATE TABLE "notificaciones" (
  "id" TEXT NOT NULL,
  "usuarioId" TEXT NOT NULL,
  "tipo" "TipoNotificacion" NOT NULL,
  "mensaje" TEXT NOT NULL,
  "referenciaTipo" TEXT NOT NULL,
  "referenciaId" TEXT NOT NULL,
  "leida" BOOLEAN NOT NULL DEFAULT false,
  "claveDedupe" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- Idempotencia por disparador: un aviso por (usuario, clave). Índice para el
-- contador de no leídas y la bandeja.
CREATE UNIQUE INDEX "notificaciones_usuarioId_claveDedupe_key" ON "notificaciones"("usuarioId", "claveDedupe");
CREATE INDEX "notificaciones_usuarioId_leida_idx" ON "notificaciones"("usuarioId", "leida");

ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill de teléfonos a E.164 (feature 012). Hasta ahora se guardaban en formato
-- nacional venezolano `0XXXXXXXXXX` (11 dígitos). Se convierten a `+58XXXXXXXXX`
-- (quitando el 0 inicial). Idempotente: solo toca los que empiezan por 0 con 11
-- dígitos; los que ya están en E.164 (empiezan por +) o vacíos se ignoran.
UPDATE "usuarios"
  SET "telefono" = '+58' || substring("telefono" from 2)
  WHERE "telefono" ~ '^0[0-9]{10}$';

UPDATE "perfiles_admin"
  SET "telefono" = '+58' || substring("telefono" from 2)
  WHERE "telefono" ~ '^0[0-9]{10}$';
