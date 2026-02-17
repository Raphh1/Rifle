import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export function setupSwagger(app) {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Rifle API",
        version: "1.0.0",
        description:
          "Documentation complète de l'API Rifle (Express + Prisma + Swagger)",
      },
      servers: [
        {
          url: "http://localhost:3000/api",
          description: "Serveur local de développement",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      // 👇 Ceci rend le bouton Authorize visible et actif par défaut
      security: [
        {
          bearerAuth: [],
        },
      ],
      tags: [
        { name: "Auth", description: "Authentification et gestion des comptes" },
        { name: "Events", description: "Gestion des événements" },
        { name: "Tickets", description: "Gestion des tickets" },
        { name: "Users", description: "Gestion des utilisateurs" },
        { name: "Admin", description: "Administration (réservé aux admins)" },
      ],
    },
    apis: ["./src/routes/*.js"], // Scanne toutes tes routes
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
