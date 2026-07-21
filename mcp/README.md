# Servidor MCP — Unidos por Guayana (solo lectura)

Servidor [MCP](https://modelcontextprotocol.io) local (transporte **stdio**) que
expone la data operativa de la plataforma como herramientas para consultarla
desde Claude (Claude Code o Claude Desktop). Es **solo lectura**: no crea ni
modifica nada.

Reutiliza los repositorios Prisma y los casos de uso puros del proyecto
(`src/modules/**`), así que las lecturas salen idénticas a las de la app.

## Herramientas

| Tool | Qué hace |
|------|----------|
| `listar-solicitudes` | Lista solicitudes; filtros opcionales `sector`, `urgencia` (BAJA/MEDIA/ALTA), `estado` (ABIERTA/ATENDIDA/CERRADA). |
| `obtener-solicitud` | Detalle de una solicitud por `id` (recursos + metadatos de archivos). |
| `contar-solicitudes-por-urgencia` | Conteo por urgencia; por defecto solo ABIERTAS (`estado` opcional). |
| `sectores-con-mas-solicitudes` | Top-N sectores con más solicitudes abiertas (`limite`, def. 5). |
| `listar-actividades` | Lista actividades; filtros opcionales `texto`, `estado`, `tipo` (ENVIO/JORNADA/EVENTO_SOCIAL). |
| `obtener-actividad` | Detalle de una actividad por `id` (metas + puntos de acopio). |

## Requisitos

- La base de datos de desarrollo corriendo (Docker en `:5435`) con `DATABASE_URL`
  en `.env` — lo mismo que necesita `pnpm dev` o `pnpm db:seed:dev`.
- Dependencias instaladas (`pnpm install`) y el cliente Prisma generado
  (`pnpm db:generate`, ya lo corre el `postinstall`).

## Cómo corre

`node mcp/bootstrap.mjs`:

1. `bootstrap.mjs` carga `.env` y monta [jiti](https://github.com/unjs/jiti)
   con el alias `@/*` → `src/*` (jiti transpila el TS del proyecto al vuelo,
   igual que `pnpm db:seed`).
2. Importa `server.ts`, que registra las tools y se conecta por stdio.

No hay paso de build: se ejecuta el TS directamente.

### Probar a mano

```bash
pnpm mcp    # arranca el server; espera JSON-RPC por stdin (Ctrl+C para salir)
```

Verás en stderr `[mcp] unidos-por-guayana listo (stdio).`. Normalmente no lo
arrancas tú: lo lanza el cliente MCP (Claude) como subproceso.

## Registrar en Claude

### Claude Code

Ya está listo: el archivo [`.mcp.json`](../.mcp.json) en la raíz declara el
servidor con alcance de proyecto. Al abrir Claude Code en este repo te pedirá
aprobarlo (una vez). Verifícalo con `/mcp` o `claude mcp list`.

### Claude Desktop

Ajustes → Developer → Edit Config, y añade dentro de `mcpServers`:

```json
{
  "mcpServers": {
    "unidos-por-guayana": {
      "command": "node",
      "args": ["mcp/bootstrap.mjs"],
      "cwd": "C:/Users/angel/Project/unidos-por-guayana"
    }
  }
}
```

`cwd` es necesario en Desktop para que `node` encuentre `mcp/bootstrap.mjs`.
Reinicia Claude Desktop tras editar.

## Notas de diseño

- **Solo lectura**: cada tool declara `readOnlyHint: true`. Si en el futuro se
  añaden operaciones de escritura, van en tools aparte y sin ese hint.
- **Sin Supabase**: a diferencia de `src/lib/solicitudes.ts`, aquí no se instancia
  el `SupabaseStorageAdapter`. Los detalles de solicitud traen metadatos de
  archivos pero **no** URLs firmadas, así que el server corre sin configurar Storage.
- **stdout es sagrado**: en stdio, stdout es el canal JSON-RPC. Todo log va a
  stderr (`console.error`).
- **Ámbito local**: pensado para uso propio/equipo contra la DB local; no lleva
  auth. No lo apuntes a producción sin añadir control de acceso.
