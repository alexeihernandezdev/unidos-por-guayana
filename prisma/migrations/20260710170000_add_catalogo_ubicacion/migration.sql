-- Feature 020: catálogo de ubicación (estado y municipio seleccionables).
-- Crea las tablas de catálogo `estados` y `municipios` (se siembran con
-- `pnpm db:seed`, idempotente por `codigo`), y reemplaza en `usuarios` y
-- `perfiles_admin` la ubicación de texto libre (`estado`/`parroquia`) por FKs
-- al catálogo (`estadoId`/`municipioId`). Los datos previos de texto libre se
-- descartan (no hay forma fiable de mapearlos): las columnas viejas se eliminan
-- y las filas existentes quedan con ubicación nula; el guard de la feature 017
-- envía a esas cuentas a `/completar-perfil` a re-seleccionar.

-- CreateTable
CREATE TABLE "estados" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipios" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estadoId" TEXT NOT NULL,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estados_codigo_key" ON "estados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "municipios_codigo_key" ON "municipios"("codigo");

-- CreateIndex
CREATE INDEX "municipios_estadoId_idx" ON "municipios"("estadoId");

-- AlterTable: usuarios — reemplaza texto libre por FKs al catálogo.
ALTER TABLE "usuarios"
    DROP COLUMN "estado",
    DROP COLUMN "parroquia",
    ADD COLUMN "estadoId" TEXT,
    ADD COLUMN "municipioId" TEXT;

-- AlterTable: perfiles_admin — reemplaza texto libre por FKs al catálogo.
ALTER TABLE "perfiles_admin"
    DROP COLUMN "estado",
    DROP COLUMN "parroquia",
    ADD COLUMN "estadoId" TEXT,
    ADD COLUMN "municipioId" TEXT;

-- CreateIndex
CREATE INDEX "usuarios_estadoId_idx" ON "usuarios"("estadoId");

-- CreateIndex
CREATE INDEX "usuarios_municipioId_idx" ON "usuarios"("municipioId");

-- CreateIndex
CREATE INDEX "perfiles_admin_estadoId_idx" ON "perfiles_admin"("estadoId");

-- CreateIndex
CREATE INDEX "perfiles_admin_municipioId_idx" ON "perfiles_admin"("municipioId");

-- AddForeignKey
ALTER TABLE "municipios" ADD CONSTRAINT "municipios_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_admin" ADD CONSTRAINT "perfiles_admin_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles_admin" ADD CONSTRAINT "perfiles_admin_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
