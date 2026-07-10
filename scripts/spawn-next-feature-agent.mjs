#!/usr/bin/env node
/**
 * Dispara el siguiente Cloud Agent de la cola de features.
 * Uso: node scripts/spawn-next-feature-agent.mjs
 *
 * Requiere CURSOR_API_KEY (Dashboard → API Keys) para lanzar automáticamente.
 * Sin clave, imprime el prompt y los pasos manuales en cursor.com/agents.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const queuePath = join(root, ".agents/feature-queue/queue.json");
const promptPath = join(root, ".agents/feature-queue/NEXT_PROMPT.md");

const queue = JSON.parse(readFileSync(queuePath, "utf8"));
const prompt = readFileSync(promptPath, "utf8");

const nextSlug = queue.order.find(
  (slug) => queue.features[slug]?.status === "pending",
);

if (!nextSlug) {
  console.log("✅ No hay features pendientes en la cola.");
  process.exit(0);
}

const next = queue.features[nextSlug];
const repoUrl =
  process.env.CURSOR_REPO_URL ??
  "https://github.com/alexeihernandezdev/unidos-por-guayana";
const baseRef = process.env.CURSOR_BASE_REF ?? "main";
const apiKey = process.env.CURSOR_API_KEY;

console.log(`\n📋 Siguiente feature: ${next.id} · ${next.title}`);
console.log(`   Slug: ${nextSlug}`);
console.log(`   Rama sugerida: ${next.branch ?? `cursor/${nextSlug}-3b92`}\n`);

if (!apiKey) {
  console.log("⚠️  CURSOR_API_KEY no configurada — lanzamiento manual:\n");
  console.log("   1. Archiva el Cloud Agent que acaba de terminar.");
  console.log("   2. Abre https://cursor.com/agents → New Agent.");
  console.log(`   3. Repo: ${repoUrl}, base: ${baseRef}`);
  console.log("   4. Pega el contenido de .agents/feature-queue/NEXT_PROMPT.md\n");
  console.log("--- NEXT_PROMPT.md ---\n");
  console.log(prompt);
  console.log("\n--- fin ---\n");
  process.exit(0);
}

const body = {
  prompt: { text: prompt },
  repos: [{ url: repoUrl, startingRef: baseRef }],
  autoCreatePR: true,
  mode: "agent",
};

const res = await fetch("https://api.cursor.com/v1/agents", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`,
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`❌ API error ${res.status}: ${err}`);
  process.exit(1);
}

const data = await res.json();
console.log("✅ Siguiente Cloud Agent lanzado.");
console.log(JSON.stringify(data, null, 2));
console.log(
  "\n👉 Archiva el agente anterior en https://cursor.com/agents para liberar contexto.\n",
);
