import express from "express";
import {
  validateHeader,
  validateSignin,
  validateUserInput,
} from "../../middlewares/validation.js";
import { authoriseAdmin, authoriseUser } from "../../middlewares/auth.js";
import {
  addUser,
  clearDatabase,
  deleteUser,
  deleteUserPermanently,
  findUser,
  allUsers,
  searchUsersByName,
  searchUsersByEmail,
} from "../../controllers/userController.js";

import {
  signin,
  signup,
  sendOTP,
  verifyOTP,
} from "../../controllers/authController.js";
import { z } from "zod";
export const userRouter = express.Router();

// Signup route
userRouter.post("/signup", validateUserInput, async (req, res) => {
  const response = await signup(req, res);

  res.json(response);
});

// Signin route
userRouter.post("/signin", validateSignin, async (req, res) => {
  const response = await signin(req, res);
  res.json(response);
});

// Send otp route
userRouter.post("/send-otp", async (req, res) => {
  const email = z.string().email().safeParse(req.body.email);
  if (!email.success) {
    return res.status(400).json({ message: "Your email is invalid" });
  }

  const response = await sendOTP(email.data);
  res.json(response);
});

//  Verify otp route
userRouter.post("/verify-otp", async (req, res) => {
  const email = z.string().email().safeParse(req.body.email);
  const otp = z.string().safeParse(req.body.otp);
  const newPass = z.string().safeParse(req.body.newPassword);
  if (!otp.success || !newPass.success || !email.success) {
    return res.status(400).json({ message: "Invalid request" });
  }
  const response = await verifyOTP(email.data, otp.data, newPass.data);
  res.json(response);
});

// Clear database route
userRouter.delete(
  "/clear-database",
  validateHeader,
  authoriseAdmin,
  async (req, res) => {
    const response = await clearDatabase();
    res.json(response);
  }
);

// Add user route
userRouter.post(
  "/add-user",
  validateHeader,
  authoriseAdmin,
  async (req, res) => {
    const { email, password, name } = req.body;
    const response = await addUser(email, password, name);
    res.json(response);
  }
);

// Soft delete user route
userRouter.patch("/delete-user/:id", authoriseUser, async (req, res) => {
  const { id } = req.params;
  const response = await deleteUser(id);
  res.json(response);
});

// Permanently delete user route
userRouter.delete(
  "/delete-user-permanently/:id",
  authoriseUser,
  async (req, res) => {
    const { id } = req.params;
    const response = await deleteUserPermanently(id);
    res.json(response);
  }
);

// Find user by ID route
userRouter.get(
  "/find-user/:id",
  validateHeader,
  authoriseAdmin,
  async (req, res) => {
    const { id } = req.params;
    const response = await findUser(id);
    res.json(response);
  }
);

// Get all users route
userRouter.get(
  "/all-users",
  validateHeader,
  authoriseAdmin,
  async (req, res) => {
    const response = await allUsers();
    res.json(response);
  }
);

// Search users by name route
userRouter.get(
  "/search-users-by-name/:name",
  authoriseUser,
  async (req, res) => {
    const { name } = req.params;
    const response = await searchUsersByName(name);
    res.json(response);
  }
);

// Search users by email route
userRouter.get("/search-users-by-email/:email", async (req, res) => {
  const { email } = req.params;
  const response = await searchUsersByEmail(email);
  res.json(response);
});
