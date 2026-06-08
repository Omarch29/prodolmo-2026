/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Login por la UI, cacheado entre tests con cy.session. */
      login(email?: string, password?: string): Chainable<void>;
      /** Cierra el modal de "elegí tu campeón" si está visible. */
      dismissChampion(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email?: string, password?: string) => {
  const user = email ?? (Cypress.env("USER_EMAIL") as string);
  const pass = password ?? (Cypress.env("USER_PASSWORD") as string);

  cy.session([user, pass], () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(user);
    cy.get('input[name="password"]').type(pass, { log: false });
    cy.contains("button", "Ingresar").click();
    cy.url().should("include", "/dashboard");
  });
});

Cypress.Commands.add("dismissChampion", () => {
  cy.get("body", { log: false }).then(($b) => {
    if ($b.find("button:contains('Más tarde')").length) {
      cy.contains("button", "Más tarde").click();
    }
  });
});

export {};
