import express from "express";
import { routerV1 } from "./routes/v1/index.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import session from "express-session";
const app = new express();
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true },
//   })
// );

app.use("/v1", routerV1);
app.use(cors());
const swaggerDoc = JSON.parse(fs.readFileSync("./swagger-output.json", "utf8"));
// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.use(express.json());
app.listen(process.env.PORT | 3000, () => {
  console.log("Listening on " + (process.env.PORT | 3000));
});
