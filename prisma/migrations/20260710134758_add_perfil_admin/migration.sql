-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('JURIDICO', 'NATURAL');

-- CreateTable
CREATE TABLE "perfiles_admin" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombreCuenta" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "parroquia" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfiles_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_acopio" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_acopio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_admin_usuarioId_key" ON "perfiles_admin"("usuarioId");

-- CreateIndex
CREATE INDEX "puntos_acopio_adminId_idx" ON "puntos_acopio"("adminId");

-- AddForeignKey
ALTER TABLE "perfiles_admin" ADD CONSTRAINT "perfiles_admin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_acopio" ADD CONSTRAINT "puntos_acopio_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
