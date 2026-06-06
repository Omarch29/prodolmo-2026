import { defineConfig } from "vitest/config";

export default defineConfig({
  // Resuelve los alias de tsconfig (@/...) de forma nativa.
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
