# spec/ — Documentación del proyecto (Spec Driven Development)

> Esta carpeta documenta **Unidos por Guayana** con desarrollo dirigido por especificación (SDD): primero se escribe la spec, luego el plan, luego las tareas, y **solo entonces** se toca el código. El objetivo es que cualquier persona (o agente) entienda qué se construye y por qué antes de programar, y que las decisiones queden por escrito.

## Cómo leer esta carpeta

Si es tu primera vez, léela en este orden:

1. **`constitution/mission.md`** — qué construimos, para quién y qué NO es. Empieza aquí.
2. **`constitution/tech-stack.md`** — tecnologías, arquitectura (Clean + Screaming), modelo de datos y convenciones.
3. **`constitution/roadmap.md`** — en qué orden se implementan las features y su estado.
4. **`features/`** — el detalle de cada feature cuando se empieza a trabajar en ella.

## Estructura

```
spec/
├── constitution/            ← reglas estables del proyecto (cambian poco)
│   ├── mission.md           ← qué construimos y para quién
│   ├── tech-stack.md        ← tecnologías, arquitectura, modelo de datos y convenciones
│   └── roadmap.md           ← orden y estado de las features
└── features/                ← una carpeta por feature
    └── NNN-nombre-feature/
        ├── spec.md          ← qué hace + criterios de aceptación
        ├── plan.md          ← cómo se implementa
        └── tasks.md         ← checklist de tareas
```

- La **constitución** es la fuente de verdad: define el rumbo y las reglas del juego. Cambia poco.
- Cada **feature** es una unidad de trabajo concreta del `roadmap`, con su propia carpeta numerada.

## Qué es la constitución

Son las reglas estables que gobiernan el proyecto. Mientras que las features van y vienen, la constitución marca el norte:

| Archivo         | Responde a…                                                        |
| --------------- | ------------------------------------------------------------------ |
| `mission.md`    | ¿Qué problema resolvemos, para quién y con qué módulos? ¿Qué NO es? |
| `tech-stack.md` | ¿Con qué lo construimos y bajo qué reglas y arquitectura?          |
| `roadmap.md`    | ¿Qué está hecho, qué toca ahora y qué viene?                       |

## Flujo para una feature nueva

1. Tomar la siguiente feature del `roadmap.md` y crear `features/NNN-nombre-feature/` con su número (`001`, `002`, …).
2. Escribir `spec.md`: qué hace, por qué y criterios de aceptación medibles.
3. Escribir `plan.md`: enfoque técnico y decisiones, respetando `constitution/tech-stack.md`.
4. **Generar la documentación de cliente en `DOC/features/NNN-nombre-feature.md`** (ver "Relación con la carpeta `DOC/`"): un resumen en lenguaje llano de qué aporta la feature y por qué, derivado de la `spec.md`.
5. Desglosar en `tasks.md` y marcar el progreso.
6. Implementar y validar (`build` / `tests` / `lint`, según la constitución).
7. Actualizar `constitution/roadmap.md` (mover la feature a "Hecho") y revisar que el `DOC/` de la feature siga fiel a lo entregado.

> **La constitución manda:** si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.

## Relación con la carpeta `DOC/`

- **`spec/`** es documentación **técnica y de producto**, para quien implementa.
- **`DOC/`** (en la raíz del repo) es el **resumen para el cliente**: explica en lenguaje llano qué se va a construir y por qué, para justificar el proyecto y alinear expectativas.

**Regla:** cada vez que se genera una feature en `spec/features/NNN-…/`, se genera también su documentación de cliente en `DOC/features/NNN-nombre-feature.md`. Así `DOC/` refleja siempre lo que se está construyendo, no solo el resumen general.

- `DOC/resumen-general.md` — visión global del proyecto (no cambia con cada feature).
- `DOC/features/NNN-nombre-feature.md` — un documento por feature, en lenguaje llano: qué aporta al cliente, por qué importa y qué queda fuera. Es la traducción no técnica de la `spec.md`; no repite el `plan.md` ni las `tasks.md`.
