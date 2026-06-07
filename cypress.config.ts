import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.ts",
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    // Usuario sembrado (npm run seed:users). Sobreescribible con CYPRESS_USER_EMAIL, etc.
    env: {
      USER_EMAIL: "omar@prode.local",
      USER_PASSWORD: "prode2026",
    },
  },
});
