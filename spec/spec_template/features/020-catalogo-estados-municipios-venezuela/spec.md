# 020 · Catálogo de estados y municipios de Venezuela

> Estado: **Hecho ✅** · Depende de: `017 · Datos de contacto obligatorios`, `016 · Perfil de administrador` · Enmienda: `016`, `017` · Roadmap: `constitution/roadmap.md`

## Qué hace

Introduce un **catálogo cerrado** de la división político-territorial de Venezuela (estados y municipios) en la base de datos, y sustituye los campos de **texto libre** `estado` / `parroquia` por **selectores en cascada** (`estado` → `municipio`) en:

- Registro de `COLABORADOR` y `SOLICITANTE` (017).
- Registro y edición de `PerfilAdmin` (016).
- Pantallas `/completar-perfil` y `/mi-perfil`.
- Bandeja del `SUPERADMIN` (visualización de ubicación del admin pendiente).

El catálogo incluye las **24 entidades federales** reconocidas (23 estados + Distrito Capital) y sus **335 municipios**, sembrados desde datos públicos (INE / ISO 3166-2). El listado completo está en [`catalogo.md`](./catalogo.md).

## Por qué

Los formularios actuales (017) aceptan `estado` y `parroquia` como texto libre, lo que produce datos inconsistentes ("La Guaira", "Vargas", "vargas"…) y dificulta filtrado geográfico en panel (008) y transparencia (009). El cliente pidió selects oficiales de **estado** y **municipio** para ubicar colaboradores, solicitantes y centros de acopio con precisión.

## Decisiones tomadas

- **Municipio, no parroquia:** el segundo nivel del selector es el **municipio** (335 en total), no la parroquia (1 146). Las parroquias quedan fuera de alcance.
- **Persistencia por FK:** `Usuario` y `PerfilAdmin` guardan `estadoId` y `municipioId` referenciando tablas `EstadoVenezuela` y `MunicipioVenezuela`. Se eliminan las columnas de texto `estado` / `parroquia`.
- **Catálogo de solo lectura:** no hay UI de administración del catálogo; se siembra con `pnpm db:seed` (idempotente).
- **Nombre oficial «La Guaira»:** el estado históricamente llamado «Vargas» se guarda como **La Guaira** (denominación vigente).
- **Validación en dominio + aplicación:** el dominio exige IDs no vacíos; la aplicación comprueba que el municipio pertenezca al estado elegido.
- **Módulo `ubicacion`:** nuevo módulo Clean + Screaming (`src/modules/ubicacion`) con casos de uso `listarEstados` y `listarMunicipiosPorEstado`.

## Alcance

**Incluye**

- Modelos Prisma `EstadoVenezuela` y `MunicipioVenezuela` + migración que reemplaza columnas de texto por FKs en `usuarios` y `perfiles_admin`.
- Seed idempotente del catálogo (24 estados, 335 municipios) desde `prisma/data/venezuela-estados-municipios.json`.
- Módulo `ubicacion` (domain / application / infrastructure) y fachada `@/shared/ubicacion`.
- Componente UI reutilizable `UbicacionSelectFields` (select estado + select municipio en cascada).
- Enmienda de formularios y server actions de registro, completar perfil, mi perfil y perfil admin.
- Enmienda de reglas de dominio (`datosContacto`, `PerfilAdmin`) y casos de uso afectados.
- Tests de validación de ubicación y listado del catálogo.
- Documentación completa del catálogo en `catalogo.md`.

**No incluye**

- Catálogo de parroquias.
- Guayana Esequiba (sin organización municipal oficial en el dataset).
- Edición del catálogo por parte del `ADMIN`.
- Migración automática de textos libres previos a IDs (cuentas existentes deben re-seleccionar en `/completar-perfil`).

## Criterios de aceptación

- [ ] Tras `pnpm db:seed`, la base contiene **24 estados** y **335 municipios**.
- [ ] Los formularios de ubicación muestran **select** de estado y municipio (cascada); no hay inputs de texto libre.
- [ ] El servidor rechaza `municipioId` que no pertenezca al `estadoId` enviado.
- [ ] `Usuario` y `PerfilAdmin` persisten `estadoId` + `municipioId` (sin columnas `estado`/`parroquia` de texto).
- [ ] La bandeja del superadmin muestra nombres legibles de estado y municipio.
- [ ] `catalogo.md` detalla todos los estados y municipios.
- [ ] `pnpm test`, `pnpm exec eslint src` y `pnpm build` en verde.

## Notas y riesgos

- **Enmienda 016/017:** rompe el contrato de texto libre; actualizar DOC de esas features al cerrar.
- **Cuentas existentes:** tras migrar, `estadoId`/`municipioId` quedan `null` → el guard de 017 redirige a `/completar-perfil`.
- **Fuente de datos:** [zokeber/venezuela-json](https://github.com/zokeber/venezuela-json) (CC BY 4.0); revisar ante cambios territoriales oficiales.
