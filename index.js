import express from "express";
import { routerV1 } from "./routes/v1/index.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { ipRateLimiter } from "./middlewares/ratelimit.js";

const app = new express();

app.use(ipRateLimiter);
app.use(cors());
app.use(express.json());

app.use("/v1", routerV1);
const swaggerDoc = JSON.parse(fs.readFileSync("./swagger-output.json", "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(process.env.PORT | 3000, () => {
  console.log("Listening on " + (process.env.PORT | 3000));
});
