// Clean

import z from "zod";
export const userSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email cannot be empty"),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().nonempty("Name cannot be empty"),
});

export const signinSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email cannot be empty"),
  password: z
    .string()
    .min(5, "Password must be at least 5 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export function validateSignin(req, res, next) {
  const bodyParsed = signinSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: bodyParsed.error.issues,
    });
  }
  console.log(bodyParsed);
  next();
}
export function validateUserInput(req, res, next) {
  const bodyParsed = userSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
      error: bodyParsed.error.issues,
    });
  }
  console.log(bodyParsed);
  next();
}
export function validateHeader(req, res, next) {
  const headerParsed = z.string().safeParse(req.header("Authorization"));
  console.log(req.header("Authorization"), headerParsed);
  if (!headerParsed.success)
    return res.json({ success: false, message: "Invalid Header" });
  next();
}
