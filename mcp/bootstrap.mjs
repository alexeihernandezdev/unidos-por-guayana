// Arranque del servidor MCP con jiti (igual que `pnpm db:seed` corre TS del repo).
//
// Hace dos cosas antes de importar `server.ts`:
//   1. Carga `.env` (DATABASE_URL) desde la raíz del proyecto, sin depender del
//      directorio de trabajo con que Claude lance el proceso.
//   2. Monta jiti con el alias `@/*` -> `src/*`. jiti 2.x ya resuelve los `paths`
//      de tsconfig por su cuenta; el alias explícito es un cinturón de seguridad.
//
// Uso: `node mcp/bootstrap.mjs` (ver `.mcp.json` y `mcp/README.md`).

import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createJiti } from "jiti";

const raiz = new URL("..", import.meta.url);

dotenv.config({ path: fileURLToPath(new URL(".env", raiz)) });

const jiti = createJiti(import.meta.url, {
  alias: {
    "@": fileURLToPath(new URL("src", raiz)),
  },
});

await jiti.import("./server.ts");
