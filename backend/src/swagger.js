const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Parking Management API",
      version: "1.0.0",
      description: "REST API for parking management — auth, parking, car entry/exit, reports",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.routes.js"],
};

module.exports = swaggerJsdoc(options);
