import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "User Management API",
    description: "API for managing users with authentication.",
  },
  host: "localhost:3000",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./index.js"]; // Add your main file here

swaggerAutogen(outputFile, endpointsFiles);
