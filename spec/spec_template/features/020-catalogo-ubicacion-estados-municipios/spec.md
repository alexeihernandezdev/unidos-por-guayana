# 020 · Catálogo de ubicación: estado y municipio seleccionables

> Estado: **Hecho ✅** · Depende de: `016 · Perfil de administrador`, `017 · Datos de contacto obligatorios` · Enmienda: `016`, `017` (y prosa de `mission.md` / `tech-stack.md`) · Roadmap: `constitution/roadmap.md`

## Qué hace

Convierte los campos de ubicación (**estado** y lo que hoy es **parroquia**) de **texto libre** a
**listas seleccionables** respaldadas por un **catálogo sembrado** de la división político-territorial
de Venezuela. Además, **sustituye `parroquia` por `municipio`** como segundo nivel de ubicación.

- **Catálogo de ubicación** — dos tablas nuevas, `estados` y `municipios`, sembradas con las **24
  entidades federales** y los **≈335 municipios** de Venezuela (ver el listado autoritativo en
  `data/estados-municipios.md`). Cada `municipio` pertenece a un `estado`.
- **Selección dependiente** — en los formularios, el usuario elige primero el **estado** de una lista;
  el desplegable de **municipio** se filtra a los municipios de ese estado. No se escribe texto libre.
- **`parroquia` → `municipio`** — el segundo nivel de ubicación pasa de "parroquia" a "municipio" en
  el modelo, la UI y los textos. Afecta a `Usuario` (colaborador/solicitante, feature 017) y a
  `PerfilAdmin` (centro de acopio, feature 016).
- **Referencia por FK** — `Usuario` y `PerfilAdmin` dejan de guardar `estado`/`parroquia` como
  `string` y pasan a referenciar el catálogo por `estadoId` y `municipioId`. La integridad
  (municipio válido y perteneciente al estado elegido) la garantizan la base y el dominio.
- **Enmienda a 016 y 017** — los formularios de registro público de admin (016), de registro de
  colaborador/solicitante y de `/completar-perfil` y `/mi-perfil` (017) pasan a usar los dos
  selectores. El guard de "perfil incompleto" (017) comprueba `estadoId`/`municipioId` en vez de los
  strings.

## Por qué

`mission.md` describe al administrador como centro de acopio que aporta "estado del país al que
pertenece, parroquia, …", y la feature 017 dejó `estado`/`parroquia` como **texto libre**,
documentando explícitamente en su `DOC/` que era provisional: _"Catálogo cerrado de estados y
parroquias: por ahora se guardan como texto libre… Si el cliente lo pide, se cambiará a un catálogo
sin re-migrar los datos."_ Este es ese cambio pedido por el cliente.

El texto libre permite errores ("Miranda" / "miranda" / "Edo. Miranda"), impide filtrar por zona de
forma fiable (features 008/009) y complica la logística del administrador. Un catálogo cerrado y
seleccionable garantiza datos consistentes, habilita filtros geográficos correctos y encaja con la
regla de "heredar ubicación del `PerfilAdmin`" que la feature 011 (puntos de acopio) necesita.

El cambio de **parroquia a municipio** responde a que el municipio es el nivel administrativo
manejable y suficiente para la logística de acopio y envío (Venezuela tiene ~335 municipios frente a
más de mil parroquias); da un catálogo mantenible sin sobre-especificar la ubicación.

## Decisiones tomadas

- **Catálogo con tablas y FK (no strings validados):** `estados` y `municipios` son tablas de
  catálogo; `Usuario` y `PerfilAdmin` referencian por `estadoId`/`municipioId`. La integridad
  relacional la asegura la base (FK) y no depende solo de la aplicación. _(Decisión del cliente:
  "Tablas catálogo con FK".)_
- **Dos niveles: estado → municipio.** Se elimina el tercer nivel (parroquia). El municipio cuelga
  del estado; el desplegable de municipio se filtra por el estado elegido.
- **`codigo` estable por catálogo:** `estados.codigo` usa ISO 3166-2:VE (`VE-A`…) y `municipios.codigo`
  usa `<codigoEstado>-<nn>`. Son claves naturales únicas que hacen la **siembra idempotente** (upsert
  por `codigo`), de modo que re-sembrar no duplica ni rompe FKs.
- **Ubicación opcional en base, obligatoria en el flujo:** igual que 017, `estadoId`/`municipioId` son
  **nullable** en base (migración segura sobre filas existentes) pero **obligatorios en el flujo** de
  registro/perfil para `COLABORADOR` / `SOLICITANTE` (y en el registro de admin para `PerfilAdmin`).
- **Datos previos (texto libre) no se mapean automáticamente:** los valores `estado`/`parroquia` que
  hoy existen como texto libre **no** se convierten a FK (no hay forma fiable de mapear "miranda" al
  registro correcto sin ambigüedad). En la migración se **descartan** (las columnas viejas se
  eliminan) y las cuentas afectadas quedan con `estadoId`/`municipioId` nulos; el guard de 017 las
  envía a `/completar-perfil` a re-seleccionar. Es coherente con la estrategia de 017 (no inventar
  datos). En dev, los usuarios de prueba sembrados re-seleccionan al probar.
- **`municipio` reemplaza a `parroquia` en todo:** modelo, UI, mensajes de validación y `DOC/`. No se
  conserva `parroquia` como campo adicional.
- **Validación en el dominio:** una función pura valida que el `municipioId` exista y **pertenezca**
  al `estadoId` elegido (coherencia estado/municipio), reutilizable por formulario y servidor. El
  catálogo se consulta vía un puerto (`CatalogoUbicacionRepository`) para no acoplar el dominio a
  Prisma.
- **Siembra como parte de `db:seed`:** el catálogo se carga en `prisma/seed.ts` (idempotente), no en
  una migración de datos, para poder re-ejecutarlo y mantenerlo actualizado sin nuevas migraciones.
- **Módulo de dominio:** el catálogo vive en un módulo propio `src/modules/ubicacion` (Clean +
  Screaming): `domain` (entidades `Estado`/`Municipio` y validación de coherencia), `application`
  (casos de uso de lectura: listar estados, listar municipios por estado) e `infrastructure`
  (repositorio Prisma). Lo consumen `usuarios` (016/017) vía fachada `@/shared/ubicacion`.

## Alcance

**Incluye**

- **Catálogo (Prisma):** nuevos modelos `Estado` (`id`, `codigo @unique`, `nombre`) y `Municipio`
  (`id`, `codigo @unique`, `nombre`, `estadoId` + relación a `Estado`, índice por `estadoId`).
- **Enmienda a `Usuario` (017):** quitar `estado String?` y `parroquia String?`; añadir
  `estadoId String?` y `municipioId String?` con relación al catálogo. **Migración** aditiva de las
  FKs + borrado de las columnas de texto libre.
- **Enmienda a `PerfilAdmin` (016):** el mismo cambio (`estado`/`parroquia` texto → `estadoId`/
  `municipioId` FK).
- **Siembra (`prisma/seed.ts`):** cargar los 24 estados y los ≈335 municipios de
  `data/estados-municipios.md`, idempotente (upsert por `codigo`). Un archivo de datos TypeScript
  (`prisma/data/venezuela-ubicacion.ts` o similar) con el listado, derivado del `.md` de la feature.
- **Módulo `src/modules/ubicacion`:**
  - `domain`: entidades `Estado`/`Municipio`, puerto `CatalogoUbicacionRepository`, y
    `validarUbicacion({ estadoId, municipioId }, catalogo)` puro (existencia + pertenencia estado↔
    municipio) con mensajes en español.
  - `application`: casos de uso de lectura `listarEstados()` y `listarMunicipiosDeEstado(estadoId)`.
  - `infrastructure`: `PrismaCatalogoUbicacionRepository`.
  - Fachada `@/shared/ubicacion`.
- **Enmienda de aplicación en `usuarios`:** `registrarUsuario` y `actualizarDatosContacto` (017) y
  `gestionarPerfilAdmin` (016) validan `estadoId`/`municipioId` contra el catálogo (coherencia) en
  vez de trim de texto libre.
- **UI — selector de ubicación dependiente:** componente reutilizable (p. ej.
  `SelectorUbicacion.tsx`) con dos `Select` (estado → municipio filtrado por estado), usado en:
  registro (colaborador/solicitante y admin/016), `/completar-perfil` y `/mi-perfil` (017) y
  `/panel/perfil` (edición de `PerfilAdmin`, 016). Reemplaza los inputs de texto de `estado`/
  `parroquia`.
- **Guard (017):** actualizar la comprobación de "perfil incompleto" para exigir `estadoId` y
  `municipioId`.
- **Tests (Vitest):** dominio (`validarUbicacion`: municipio inexistente, municipio de otro estado,
  válido) con un fake de catálogo en memoria; casos de uso de lectura; enmiendas de
  `registrarUsuario`/`actualizarDatosContacto`/`gestionarPerfilAdmin` con el fake.

**No incluye**

- **Parroquias** (tercer nivel) ni sectores/urbanizaciones: el catálogo llega hasta **municipio**. El
  `sectorDestino` de `Ayuda` y el `sector` de `Solicitud` siguen siendo texto libre (no son ubicación
  del catálogo).
- **Puntos de acopio (011):** esta feature no implementa `PuntoAcopio`; solo deja el catálogo y la
  regla de herencia de ubicación listos para que 011 los consuma.
- **Filtros geográficos nuevos en 008/009:** habilita datos consistentes, pero añadir filtros por
  estado/municipio en panel o transparencia es trabajo de esas features.
- **Migración de datos de texto libre a FK:** los valores previos se descartan; no se intenta mapear.
- **Edición del catálogo desde la app:** el catálogo es de solo lectura para los usuarios; se mantiene
  vía seed, no hay CRUD de estados/municipios.
- **Otros países:** solo Venezuela.

## Reglas de validación (dominio)

> Mensajes en **español**, reutilizables por formulario y servidor.

### Ubicación (`estadoId` + `municipioId`)

- **Entrada:** dos identificadores del catálogo (los `id` de `Estado` y `Municipio`).
- **Reglas:**
  - `estadoId` debe existir en el catálogo.
  - `municipioId` debe existir en el catálogo **y** su `estadoId` debe coincidir con el `estadoId`
    seleccionado (coherencia estado↔municipio).
  - Para `COLABORADOR` / `SOLICITANTE` (017) y para el `PerfilAdmin` (016), ambos son **obligatorios**.
- **Mensajes:**
  - `estadoId` vacío: `"Selecciona el estado."`
  - `municipioId` vacío: `"Selecciona el municipio."`
  - Estado inexistente: `"El estado seleccionado no es válido."`
  - Municipio inexistente: `"El municipio seleccionado no es válido."`
  - Municipio que no pertenece al estado: `"El municipio no pertenece al estado seleccionado."`

## Criterios de aceptación

- [ ] Existen las tablas `estados` y `municipios`; tras `pnpm db:seed` contienen las **24** entidades
      federales y el total de municipios del listado reconciliado (~335), y re-ejecutar el seed **no
      duplica** filas (idempotente por `codigo`).
- [ ] En el **registro** de `COLABORADOR` / `SOLICITANTE`, la ubicación se elige con **dos
      desplegables**: al elegir un estado, el desplegable de municipio muestra **solo** los municipios
      de ese estado. No hay input de texto libre para ubicación.
- [ ] El mismo selector aparece en el **registro público de admin** (016), en `/completar-perfil` y
      `/mi-perfil` (017) y en `/panel/perfil` (016).
- [ ] El **servidor rechaza** guardar una ubicación con `municipioId` que no pertenece al `estadoId`,
      o con estado/municipio inexistente, con los mensajes en español definidos arriba (validado en
      `registrarUsuario`, `actualizarDatosContacto` y `gestionarPerfilAdmin`, aunque el formulario se
      saltara).
- [ ] `Usuario` y `PerfilAdmin` guardan `estadoId` y `municipioId` (FK al catálogo); ya **no** existen
      las columnas de texto libre `estado`/`parroquia`, ni el término "parroquia" en la UI.
- [ ] El **guard** de perfil incompleto (017) redirige a `/completar-perfil` a los `COLABORADOR` /
      `SOLICITANTE` que no tengan `estadoId` **y** `municipioId`.
- [ ] La **migración** elimina las columnas viejas y añade las FKs sin romper la base; las filas
      existentes quedan con ubicación nula (a re-seleccionar por el guard).
- [ ] `src/modules/ubicacion/domain` y `application` son **puras** (sin Prisma ni framework); el
      catálogo se consulta por el puerto `CatalogoUbicacionRepository`.
- [ ] `pnpm test` cubre `validarUbicacion` (coherencia estado↔municipio) y las lecturas del catálogo,
      en verde.
- [ ] `pnpm lint` / `pnpm build` sin errores.

## Notas y riesgos

- **Enmienda a 016 y 017 (features "Hecho"):** esta feature modifica el modelo `Usuario` y
  `PerfilAdmin`, sus casos de uso y formularios, y renombra parroquia→municipio. Al cerrarla, revisar
  y actualizar los `DOC/` de 016 y 017, y la **prosa de la constitución** (`mission.md` habla de
  "parroquia" para el admin; `tech-stack.md` describe `PerfilAdmin`/`Usuario` con `parroquia` y
  "ubicación como texto libre"): actualizar ambos a "municipio" y "catálogo seleccionable".
- **Exactitud del listado de municipios:** el `.md` de datos es exhaustivo pero debe **reconciliarse
  contra una fuente oficial (INE / Gaceta Oficial)** antes de sembrar; hay un caso marcado (Trujillo:
  20 vs 21). El total esperado ronda 335. La clave `codigo` permite corregir nombres sin romper FKs.
- **`La Guaira` (antes `Vargas`):** el catálogo usa el nombre vigente `La Guaira` (ISO `VE-X`), estado
  de origen de los envíos. Su único municipio es `Vargas`.
- **Sin dependencias nuevas:** se reutilizan Prisma, React Hook Form y los `Select` de Shadcn ya
  presentes. Si hiciera falta algo, **avisar** (límite duro de la constitución).
- **Rendimiento del selector:** ≈335 municipios es poco; se puede cargar el catálogo completo en el
  cliente o pedir municipios por estado bajo demanda. Decisión de implementación en `plan.md`.
- **Pureza de capas:** la validación de coherencia estado↔municipio es dominio puro que recibe el
  catálogo por un puerto; Prisma es un adaptador. ESLint hace cumplir la dirección de dependencias.
