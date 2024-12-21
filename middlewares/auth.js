import prisma from "../db/index.js";
import jwt from "jsonwebtoken";

export async function authoriseUser(req, res, next) {
  const token = req.header.Authorization.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (JsonWebTokenError) {
    console.log("Invalid signature");
    return res.json({ success: false, message: "Invalid signature" });
  }
  if (new Date().getTime() > decoded.expires) {
    console.log("Token expired");
    return res.json({ success: false, message: "Token has expired" });
  }

  return next();
}

export async function authoriseAdmin(req, res, next) {
  const token = req.header("Authorization").split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (JsonWebTokenError) {
    console.log("Invalid signature");
    return res.json({ success: false, message: "Invalid signature" });
  }
  if (new Date().getTime() > decoded.expires) {
    console.log("Token expired");
    return res.json({ success: false, message: "Token has expired" });
  }
  console.log(decoded);
  if (decoded.role !== role) {
    return res.json({ success: false, message: "Unauthorised" });
  }
  return next();
}

export async function uniqueUsername(req, res, next) {
  const { username } = req.body;
  const result = await prisma.user.findMany({
    where: {
      username: username,
    },
  });

  if (result) return false;
  return true;
}
