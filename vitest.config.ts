import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(new URL(import.meta.url)));

const nuxtProject = await defineVitestProject({
  test: {
    name: "nuxt",
    include: ["tests/nuxt/**/*.{test,spec}.ts"],
    environment: "nuxt",
  },
});

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "html", "json-summary"],
      include: [
        "domain/**/*.ts",
        "application/**/*.ts",
        "infrastructure/**/*.ts",
        "server/**/*.ts",
        "shared/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.d.ts",
        "tests/**",
        ".nuxt/**",
        "node_modules/**",
        "generated/**",
      ],
    },
    projects: [
      {
        resolve: {
          alias: {
            "~~": root,
          },
        },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.{test,spec}.ts"],
          environment: "node",
        },
      },
      nuxtProject,
    ],
    silent: false,
  },
});
