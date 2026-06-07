describe("Navegación de la app (autenticado)", () => {
  beforeEach(() => {
    cy.login();
  });

  it("muestra el dashboard", () => {
    cy.visit("/dashboard");
    cy.contains("HOLA,").should("be.visible"); // saludo desktop
    cy.contains("CÓMO VA LA TABLA").should("be.visible"); // bloque desktop
  });

  it("Cargar: lista con toggle por jugar / jugados y filtros", () => {
    cy.visit("/cargar");
    cy.contains("⚽ CARGAR").should("be.visible");
    cy.contains("POR JUGAR").should("be.visible");
    cy.contains("JUGADOS").should("be.visible");
  });

  it("Tabla de posiciones", () => {
    cy.visit("/tabla");
    cy.contains("🏆 TABLA").should("be.visible");
    cy.contains("JUGADORES").should("be.visible");
  });

  it("Simulador: arranca en el paso de grupos", () => {
    cy.visit("/sim");
    cy.contains("SIMULADOR").should("be.visible");
    cy.contains("Grupos").should("be.visible");
    cy.contains("GRUPO A").should("be.visible");
  });

  it("navega por el sidebar entre pantallas", () => {
    cy.visit("/dashboard");
    cy.contains("a", "TABLA").click();
    cy.url().should("include", "/tabla");
    cy.contains("a", "SIM").click();
    cy.url().should("include", "/sim");
  });

  it("logout vuelve al login", () => {
    cy.visit("/dashboard");
    cy.contains("button", "Salir").click();
    cy.url().should("include", "/login");
  });
});
