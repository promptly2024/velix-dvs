const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description: "API documentation for Authentication routes.",
    },
    servers: [{ url: "http://localhost:3001/api/v1" }],
    components: {
      schemas: {
        registerUser: {
          type: "object",
          required: ["email", "password", "username"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            username: { type: "string" },
          },
        },
        loginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        verifyEmail: {
          type: "object",
          required: ["email", "otp"],
          properties: {
            email: { type: "string", format: "email" },
            otp: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export default swaggerOptions;
