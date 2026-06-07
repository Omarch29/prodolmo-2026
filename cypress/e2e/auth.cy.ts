describe("Autenticación", () => {
  it("redirige a /login si no hay sesión", () => {
    cy.visit("/dashboard");
    cy.url().should("include", "/login");
    cy.contains("PRODOLMO 2026").should("be.visible");
  });

  it("rechaza credenciales inválidas", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("omar@prode.local");
    cy.get('input[name="password"]').type("malísima");
    cy.contains("button", "Ingresar").click();
    cy.contains("Credenciales incorrectas").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("ingresa con credenciales válidas y llega al dashboard", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(Cypress.env("USER_EMAIL"));
    cy.get('input[name="password"]').type(Cypress.env("USER_PASSWORD"), { log: false });
    cy.contains("button", "Ingresar").click();
    cy.url().should("include", "/dashboard");
    cy.contains("HOLA,").should("be.visible"); // saludo del dashboard desktop
  });
});
