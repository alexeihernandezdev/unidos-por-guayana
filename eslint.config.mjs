import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";

// ────────────────────────────────────────────────────────────────────────────
// Capas de la arquitectura (Clean + Screaming). Ver spec/.../tech-stack.md.
// Cada dominio vive en src/modules/<dominio>/{domain,application,infrastructure,ui}.
// La dirección de dependencias permitida es:
//   domain          → (nada)
//   application     → domain
//   infrastructure  → domain, application
//   presentation    → application, domain           (ui de cada módulo + src/app)
// src/lib es infraestructura global; src/shared es transversal (permitido a todos).
// ────────────────────────────────────────────────────────────────────────────
const DOMAIN = "./src/modules/*/domain/**";
const APPLICATION = "./src/modules/*/application/**";
const INFRASTRUCTURE = "./src/modules/*/infrastructure/**";
const UI = "./src/modules/*/ui/**";
const APP = "./src/app/**";
const LIB = "./src/lib/**";

// Paquetes de framework/infra prohibidos en las capas puras (domain/application).
const FRAMEWORK_PACKAGES = [
  "react",
  "react-dom",
  "next",
  "next/*",
  "@prisma/client",
  "@tanstack/*",
  "zustand",
  "react-hook-form",
];

// Rutas relativas "largas" (dos o más niveles arriba): preferir el alias @/…
const DEEP_RELATIVE = ["../../*", "../../../*", "../../../../*"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // ── Límites de capas: dirección de dependencias (Clean Architecture) ──
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: DOMAIN,
              from: [APPLICATION, INFRASTRUCTURE, UI, APP, LIB],
              message:
                "La capa domain no puede depender de application, infrastructure ni presentation (tech-stack.md).",
            },
            {
              target: APPLICATION,
              from: [INFRASTRUCTURE, UI, APP, LIB],
              message:
                "La capa application solo puede depender de domain (tech-stack.md).",
            },
            {
              target: [UI, APP],
              from: [INFRASTRUCTURE, LIB],
              message:
                "La presentación (ui / app) no debe importar infrastructure ni lib directamente; pasa por application (tech-stack.md).",
            },
            {
              target: INFRASTRUCTURE,
              from: [UI, APP],
              message:
                "La capa infrastructure no debe depender de la presentación (tech-stack.md).",
            },
          ],
        },
      ],
    },
  },

  // ── Convención transversal: preferir el alias @/… sobre rutas relativas largas ──
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: DEEP_RELATIVE,
              message:
                "Usa el alias @/… en lugar de rutas relativas largas (tech-stack.md).",
            },
          ],
        },
      ],
    },
  },

  // ── Pureza de domain/application: sin dependencias de framework ni infra ──
  // (Se define después para que gane sobre el bloque del alias en estos archivos,
  //  incluyendo también ahí la regla de rutas relativas largas.)
  {
    files: [
      "src/modules/*/domain/**/*.{ts,tsx}",
      "src/modules/*/application/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: FRAMEWORK_PACKAGES,
              message:
                "Las capas domain/application deben ser puras: sin framework ni infraestructura (tech-stack.md).",
            },
            {
              group: DEEP_RELATIVE,
              message:
                "Usa el alias @/… en lugar de rutas relativas largas (tech-stack.md).",
            },
          ],
        },
      ],
    },
  },

  // ── Convenciones de naming (ver tabla en tech-stack.md) ──
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        // Variables: camelCase; PascalCase para componentes; UPPER_CASE para constantes.
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
        },
        // Funciones: camelCase; PascalCase para componentes de React.
        { selector: "function", format: ["camelCase", "PascalCase"] },
        // Tipos, interfaces, clases, enums: PascalCase.
        { selector: "typeLike", format: ["PascalCase"] },
        // Miembros de enum: UPPER_CASE (p. ej. estados RECOLECTANDO) o PascalCase.
        { selector: "enumMember", format: ["UPPER_CASE", "PascalCase"] },
      ],
    },
  },

  // ── Casing de nombres de archivo y carpeta (ver tabla en tech-stack.md) ──
  // Convención: los componentes son *.tsx (PascalCase) y los barriles son index.ts.
  // (El casing de *.module.css no se enforca aquí: ESLint 9 no parsea CSS sin el
  //  paquete @eslint/css, que no se ha añadido.)
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "check-file": checkFile },
    rules: {
      "check-file/filename-naming-convention": [
        "warn",
        {
          // Componentes propios de un módulo: PascalCase (UserCard.tsx).
          "src/modules/*/ui/**/*.tsx": "PASCAL_CASE",
          // Primitivos de Shadcn (viven en src/shared/ui): kebab-case, que es su
          // convención de la librería (button.tsx, dropdown-menu.tsx…).
          "src/shared/ui/**/*.tsx": "KEBAB_CASE",
          // Hooks: camelCase, por convención con prefijo "use" (useAuthUser.ts).
          "src/**/use*.{ts,tsx}": "CAMEL_CASE",
        },
        { ignoreMiddleExtensions: true },
      ],
      // Carpetas de dominio (Screaming Architecture): kebab-case (puntos-acopio).
      "check-file/folder-naming-convention": [
        "warn",
        { "src/modules/*": "KEBAB_CASE" },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Cliente de Prisma generado (no es código nuestro; se regenera).
    "src/generated/**",
    // Scripts auxiliares de las skills de Claude Code (no son código de la app;
    // usan CommonJS y no siguen las reglas del proyecto).
    ".claude/**",
  ]),
]);

export default eslintConfig;
