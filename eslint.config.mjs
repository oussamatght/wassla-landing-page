import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Fixtures may only be reached through the services layer (src/services/data-source.ts).
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/fixtures", "@/fixtures/*"],
              message:
                "Import fixtures only from src/services/data-source.ts (flag-guarded).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/services/data-source.ts", "tests/**", "src/app/design/**"],
    rules: { "no-restricted-imports": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    "public/**",
  ]),
]);

export default eslintConfig;
