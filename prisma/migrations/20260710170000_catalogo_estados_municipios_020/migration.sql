-- Feature 020: catálogo de estados/municipios de Venezuela y FK en usuarios/perfil.

CREATE TABLE "estados_venezuela" (
    "id" TEXT NOT NULL,
    "codigoIso" TEXT NOT NULL,
    "idIne" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "capital" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_venezuela_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "municipios_venezuela" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "capital" TEXT,
    "estadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipios_venezuela_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "estados_venezuela_codigoIso_key" ON "estados_venezuela"("codigoIso");
CREATE UNIQUE INDEX "estados_venezuela_idIne_key" ON "estados_venezuela"("idIne");
CREATE UNIQUE INDEX "estados_venezuela_nombre_key" ON "estados_venezuela"("nombre");
CREATE INDEX "municipios_venezuela_estadoId_idx" ON "municipios_venezuela"("estadoId");
CREATE UNIQUE INDEX "municipios_venezuela_estadoId_nombre_key" ON "municipios_venezuela"("estadoId", "nombre");

ALTER TABLE "municipios_venezuela" ADD CONSTRAINT "municipios_venezuela_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados_venezuela"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "usuarios" DROP COLUMN "estado",
DROP COLUMN "parroquia";

ALTER TABLE "usuarios" ADD COLUMN "estadoId" TEXT,
ADD COLUMN "municipioId" TEXT;

ALTER TABLE "perfiles_admin" DROP COLUMN "estado",
DROP COLUMN "parroquia";

ALTER TABLE "perfiles_admin" ADD COLUMN "estadoId" TEXT,
ADD COLUMN "municipioId" TEXT;

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados_venezuela"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios_venezuela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "perfiles_admin" ADD CONSTRAINT "perfiles_admin_estadoId_fkey" FOREIGN KEY ("estadoId") REFERENCES "estados_venezuela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "perfiles_admin" ADD CONSTRAINT "perfiles_admin_municipioId_fkey" FOREIGN KEY ("municipioId") REFERENCES "municipios_venezuela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "perfiles_admin" ALTER COLUMN "estadoId" SET NOT NULL;
ALTER TABLE "perfiles_admin" ALTER COLUMN "municipioId" SET NOT NULL;
