import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
console.log("Prisma client connected");
export default prisma;
