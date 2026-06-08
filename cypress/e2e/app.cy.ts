describe("Navegación de la app (autenticado)", () => {
  beforeEach(() => {
    cy.login();
  });

  it("muestra el dashboard", () => {
    cy.visit("/dashboard");
    cy.dismissChampion();
    cy.contains("HOLA,").should("be.visible"); // saludo desktop
    cy.contains("CÓMO VA LA TABLA").should("be.visible"); // bloque desktop
  });

  it("Cargar: lista con toggle por jugar / jugados y filtros", () => {
    cy.visit("/cargar");
    cy.dismissChampion();
    cy.contains("⚽ CARGAR").should("be.visible");
    cy.contains("POR JUGAR").should("be.visible");
    cy.contains("JUGADOS").should("be.visible");
  });

  it("Tabla de posiciones", () => {
    cy.visit("/tabla");
    cy.dismissChampion();
    cy.contains("🏆 TABLA").should("be.visible");
    cy.contains("JUGADORES").should("be.visible");
  });

  it("INFO explica el sistema de puntos", () => {
    cy.visit("/info");
    cy.dismissChampion();
    cy.contains("CÓMO SE PUNTÚA").should("be.visible");
    cy.contains("CÓMO ESCALA POR RONDA").should("be.visible");
    cy.contains("CAMPEÓN DEL MUNDIAL").should("be.visible");
  });

  it("Simulador: arranca en el paso de grupos", () => {
    cy.visit("/sim");
    cy.dismissChampion();
    cy.contains("SIMULADOR").should("be.visible");
    cy.contains("Grupos").should("be.visible");
    cy.contains("GRUPO A").should("be.visible");
  });

  it("navega por el sidebar entre pantallas", () => {
    cy.visit("/dashboard");
    cy.dismissChampion();
    cy.contains("a", "TABLA").click();
    cy.url().should("include", "/tabla");
    cy.contains("a", "SIM").click();
    cy.url().should("include", "/sim");
  });

  it("logout vuelve al login", () => {
    cy.visit("/dashboard");
    cy.dismissChampion();
    cy.contains("button", "Salir").click();
    cy.url().should("include", "/login");
  });
});
