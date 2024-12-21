import express from "express";
import { userRouter } from "./user.js";
export const routerV1 = new express();

routerV1.use("/user", userRouter);
