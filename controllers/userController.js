import prisma from "../db/index.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";

export async function deleteUser(id) {
  try {
    await prisma.user.update({
      where: { id },
      data: { deleted: true },
    });
    return { success: true, message: "User deleted" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}
export async function deleteUserPermanently(id) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    return { success: true, message: "User deleted Permanently" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
}
export async function clearDatabase() {
  try {
    await prisma.user.deleteMany({});
    return { success: true, message: "Database cleared" };
  } catch (error) {
    console.error("Error clearing database:", error);
    return { success: false, error: error.message };
  }
}
export async function searchUsersByName(name) {
  try {
    const users = await prisma.user.findMany({
      where: { name },
      deleted: false,
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error searching users by name:", error);
    return { success: false, error: error.message };
  }
}
export async function searchUsersByEmail(email) {
  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: "insensitive", // Case-insensitive search
        },
        deleted: false,
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error searching users by email:", error);
    return { success: false, error: error.message };
  }
}
export async function addUser(email, password, name) {
  return signup(email, password, name); // Reuse signup function
}
export async function findUser(id) {
  try {
    const user = await prisma.user.findUnique({
      where: { id, deleted: false },
    });
    if (!user) return { success: false, message: "User not found" };

    return { success: true, user };
  } catch (error) {
    console.error("Error finding user:", error);
    return { success: false, error: error.message };
  }
}
export async function allUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        deleted: false,
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error finding users:", error);
    return { success: false, error: error.message };
  }
}
export async function createAdmin(email, name, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      },
    });
    const token = tokenise(email, "admin");
    return { success: true, token: token, id: user.id };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, error: error.message };
  }
}
