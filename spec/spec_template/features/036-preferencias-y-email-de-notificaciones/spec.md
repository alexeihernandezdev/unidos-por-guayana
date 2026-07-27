# 036 · Preferencias y email de notificaciones

> Estado: **Implementada** · Extiende: `012 · Notificaciones` · Depende de: `006`, `007`, `015`, `019`, `025`, `032` y `035`

## Qué hace

Convierte el módulo de notificaciones en un centro de avisos configurable para todos los roles
autenticados. Conserva el canal **in-app siempre activo**, incorpora Email mediante SMTP genérico,
permite elegir Email y WhatsApp por categoría de evento y añade `/ajustes` como destino común de
configuración.

SMTP es plug-and-play: al definir las variables del servidor, la entrega por correo queda activa sin
cambiar código. La plataforma envía desde una cuenta institucional exclusivamente emisora hacia el
email registrado del usuario. Sin configuración SMTP, in-app y WhatsApp continúan funcionando.

## Decisiones aprobadas

- **In-app obligatorio:** no puede desactivarse y sigue siendo el registro principal del aviso.
- **Canales externos configurables por evento:** Email y WhatsApp se guardan por
  `(usuario, tipoNotificacion)`.
- **Valores iniciales:** Email activo; WhatsApp activo cuando el destinatario tenga un teléfono
  marcado como WhatsApp. La ausencia de una preferencia explícita se interpreta con estos valores.
- **Todos los roles:** `/ajustes` está disponible en el grupo «Mi cuenta» de cada sidebar y muestra
  solo las categorías aplicables al rol.
- **Correo institucional:** una única identidad emisora configurada por entorno; no se admite elegir
  remitente ni destinatarios arbitrarios desde la UI.
- **Prueba segura:** «Enviar correo de prueba» usa exclusivamente el email de la sesión.
- **Entrega inmediata y best-effort:** no hay digest, scheduler, cola ni reintentos automáticos.
- **Agrupación semántica:** una preferencia puede cubrir varios resultados del mismo proceso, por
  ejemplo «Estado de mi solicitud» cubre atendida y cerrada.

## Catálogo de eventos y destinatarios

| Categoría | Destinatarios | Disparador |
| --- | --- | --- |
| `NUEVA_ACTIVIDAD` | Colaboradores aptos de la red | Se crea una actividad con metas compatibles. |
| `META_CUMPLIDA` | Admin dueño y colaboradores de la meta | Un aporte recibido cruza el 100 %. |
| `NUEVO_APORTE` | Admin dueño de la actividad | Un colaborador registra un aporte. |
| `ESTADO_APORTE` | Colaborador dueño | El admin marca recibido o cancela; no avisa autocancelación. |
| `NUEVA_AFILIACION` | Admin del centro | Un colaborador se une a su red. |
| `AFILIACION_REMOVIDA` | Colaborador | El admin lo retira; no avisa una salida iniciada por él. |
| `NUEVA_SOLICITUD_ZONA` | Admins verificados del mismo municipio | Se crea una solicitud abierta. |
| `ESTADO_SOLICITUD` | Solicitante dueño | Un admin marca atendida o cierra la solicitud. |
| `ACTUALIZACION_AUDITORIA` | Solicitante dueño | Auditoría solicita información, verifica o rechaza. |
| `NUEVA_SOLICITUD_AUDITABLE` | Auditores activos | Una solicitud nueva entra a la cola común. |
| `RESULTADO_PROPUESTA_RECURSO` | Solicitante proponente | Su recurso es aprobado o rechazado. |
| `RESULTADO_TESTIMONIO` | Autor | Su testimonio es aprobado o rechazado. |
| `NUEVO_ADMIN_PENDIENTE` | Superadmins | Se registra una cuenta administradora pendiente. |
| `ESTADO_CUENTA_ADMIN` | Cuenta administradora | El superadmin la aprueba o rechaza. |

La categoría identifica la preferencia. El mensaje, asunto, referencia y clave de deduplicación sí
varían según el resultado concreto. La cuenta administradora pendiente recibe el resultado por Email
con sus valores por defecto aunque todavía no pueda entrar a Ajustes.

## Arquitectura

- `PreferenciaNotificacion` persiste `usuarioId`, `tipo`, `emailActivo` y `whatsappActivo`, con
  unicidad por usuario y tipo.
- El dominio define el catálogo aplicable por rol, los valores efectivos y los contratos
  `PreferenciaNotificacionRepository` y `CanalEmail`.
- El lector de contacto obtiene el email registrado y el nombre, además del teléfono efectivo que
  ya resuelve para WhatsApp.
- El emisor crea in-app para todos los destinatarios nuevos, resuelve preferencias y ejecuta Email y
  WhatsApp en paralelo con aislamiento de fallos.
- `SmtpEmailAdapter` encapsula transporte, disponibilidad, correo de prueba y mensajes HTML/texto.
- La presentación accede mediante la fachada compartida; Server Components y Server Actions no
  importan Prisma ni el adaptador SMTP directamente.

## Configuración SMTP

Variables solo de servidor:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`

Todas las variables obligatorias deben estar presentes para considerar disponible el canal. La
contraseña nunca se imprime ni se expone al cliente. Los correos incluyen texto plano y HTML,
contenido dinámico escapado, asunto contextual y enlace absoluto basado en `NEXT_PUBLIC_SITE_URL`.

## Diseño de `/ajustes`

**Intento:** una persona que coordina, aporta, solicita o audita ayuda necesita decidir dónde recibir
cada aviso sin perder la certeza de que el sistema siempre conservará una copia.

**Dirección:** interfaz tranquila, confiable y operativa, nacida de los conceptos de red, convocatoria,
hito, territorio y canal. Conserva el mundo cromático existente (azul institucional/costa, arena,
blanco salino, grafito y verde semántico), Geist, Lucide y el sistema `Panel*`.

**Firma:** filas «evento → canales». Cada fila explica el hecho y presenta:

- In-app como estado fijo «Siempre activo».
- Email como interruptor editable o indisponible si SMTP no está configurado.
- WhatsApp como interruptor editable o indisponible si falta un teléfono WhatsApp.

Se evita una tabla rígida y la cuadrícula genérica de tarjetas. En escritorio las filas son
horizontales y escaneables; en móvil apilan los canales sin scroll horizontal. Los cambios se guardan
al instante con estado pendiente, confirmación accesible y reversión si falla.

Un bloque «Correo electrónico» muestra el email registrado, disponibilidad SMTP y el botón de prueba.
Roles sin categorías actuales ven un estado informativo, no una página vacía.

## Seguridad, fallos y privacidad

- Todas las consultas y mutaciones se limitan al usuario autenticado.
- El servidor valida tipo, canal y aplicabilidad al rol; nunca confía en el payload del cliente.
- Un fallo externo no revierte la operación de negocio ni elimina el aviso in-app.
- Los logs incluyen canal, categoría e identificador interno, sin secretos ni contenido sensible.
- El correo de prueba no acepta un destinatario enviado por el navegador.
- Los mensajes HTML escapan todos los valores dinámicos.
- No se persiste estado de entrega externo ni se reintenta automáticamente en esta entrega.

## Criterios de aceptación

- [ ] In-app se crea siempre y no existe control para desactivarlo.
- [ ] Email y WhatsApp pueden configurarse de forma independiente por categoría aplicable.
- [ ] La ausencia de preferencia activa Email y activa WhatsApp solo con teléfono WhatsApp.
- [ ] `/ajustes` está protegido, aparece en la navegación de los cinco roles y usa el shell común.
- [ ] Los 14 eventos anteriores generan destinatarios, mensajes, enlaces y deduplicación correctos.
- [ ] `NUEVA_SOLICITUD_ZONA` solo alcanza admins verificados del municipio de la solicitud.
- [ ] Acciones iniciadas por la propia persona no generan los avisos excluidos.
- [ ] SMTP se activa únicamente mediante variables de entorno y degrada sin romper otros canales.
- [ ] Cada email tiene HTML, texto plano, remitente institucional y enlace absoluto.
- [ ] El botón de prueba envía solo al email registrado y comunica éxito o error accionable.
- [ ] Fallos de Email y WhatsApp quedan aislados entre sí y de la operación principal.
- [ ] Los controles tienen label accesible, foco visible, estado pendiente y objetivo táctil ≥ 44 px.
- [ ] La vista funciona sin scroll horizontal a 375 px y respeta `prefers-reduced-motion`.
- [ ] Tests, lint, generación Prisma y build finalizan sin errores atribuibles a la feature.

## Fuera de alcance

- Digests diarios o semanales, recordatorios, scheduler y zonas horarias.
- Cola/outbox, reintentos, tracking de apertura, rebotes o panel de entregabilidad.
- Edición de credenciales SMTP desde la aplicación.
- Remitentes o destinatarios introducidos por el usuario.
- Push móvil, SMS y nuevos proveedores de mensajería.
