# Catálogo de estados y municipios de Venezuela

## Qué aporta

Los formularios de registro, perfil y centro de acopio ya no piden escribir estado y parroquia a mano. Ahora el usuario **elige su estado** en una lista y, acto seguido, **el municipio** correspondiente. Así todos los datos de ubicación quedan uniformes y alineados con la división oficial de Venezuela.

## Detalle del catálogo

- **24 entidades federales** (23 estados + Distrito Capital)
- **335 municipios** en total
- Datos sembrados en la base de datos al ejecutar `pnpm db:seed`
- Listado completo en la documentación técnica: `spec/spec_template/features/020-catalogo-estados-municipios-venezuela/catalogo.md`

## Dónde se usa

- Registro de colaboradores y solicitantes
- Registro de administradores / centros de acopio
- Completar perfil y Mi perfil
- Edición del perfil de administrador
- Bandeja de aprobación del superadministrador (muestra estado y municipio legibles)

## Qué cambió respecto a antes

Antes se pedía **estado** y **parroquia** como texto libre. Ahora se pide **estado** y **municipio** desde listas cerradas. Las parroquias no forman parte de esta versión.

## Nota para cuentas existentes

Si había usuarios con ubicación escrita a mano, deberán **volver a elegir** estado y municipio en «Completar perfil» o «Mi perfil» tras actualizar la plataforma.
