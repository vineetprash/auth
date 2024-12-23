import prisma from "../model/index.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import fs from "fs";
import { OTP_EXPIRY } from "../constants/index.js";
import redisClient from "../redis/index.js";
import { uniqueUser } from "../middlewares/auth.js";

export async function signup(req, res, next) {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash password
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    const token = tokenise(email, "user");
    console.log(req.body, token);
    return { success: true, token: token, id: user.id };
  } catch (error) {
    console.error("Error during signup:", error);
    return { success: false, error: error.message };
  }
}

export async function signin(req, res) {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email, deleted: false },
    });
    if (!user) return { success: false, message: "User not found" };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return { success: false, message: "Invalid password" };
    const token = tokenise(email, user);
    return { success: true, token: token, id: user.id };
  } catch (error) {
    console.error("Error during signin:", error);
    return { success: false, error: error.message };
  }
}

export async function resetPass(email, oldPass, newPass, bypass) {
  const user = await prisma.user.findUnique({
    where: { email, deleted: false },
  });
  if (!user) {
    return { success: false, message: "User not found" };
  }
  if (!bypass) {
    const isValid = await bcrypt.compare(oldPass, user.password);
    if (!isValid) return { success: false, message: "Invalid password" };
  }
  const hashedNewPass = await bcrypt.hash(newPass, 10);

  try {
    await prisma.user.update({
      where: { email },
      data: { password: hashedNewPass },
    });
    return { success: true, message: "Password successfully reset" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function sendOTP(email) {
  const otp = Math.floor(10000 + Math.random() * 90000);
  const user = uniqueUser(email);
  if (!user) return { success: false, message: "User not found" };
  const key = `otp:${email}`;
  const existingOTP = await redisClient.get(key);
  if (existingOTP) {
    return {
      success: false,
      message:
        "An OTP is already sent. Please wait until it expires or verify the existing OTP.",
    };
  }
  sendMail(otp, email);
  await redisClient.setEx(key, OTP_EXPIRY, otp.toString());
  return { success: true, message: "OTP sent to: " + email };
}

function sendMail(otp, recepient) {
  const embed = fs
    .readFileSync(".\\view\\otp.html")
    .toString()
    .replace("${otp}", otp);

  console.log(process.env.EMAIL_ID);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_ID,
    to: recepient,
    subject: "Hello from Vineet",
    html: embed,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

export async function verifyOTP(email, otp, newPass) {
  const key = `otp:${email}`;
  const storedOtp = await redisClient.get(key);
  console.log(otp, storedOtp);
  if (!otp) {
    return { success: false, message: "OTP Expired" };
  }

  if (otp !== storedOtp) {
    return { success: false, message: "Invalid OTP" };
  }

  if (otp === storedOtp) {
    const res = await resetPass(email, "", newPass, true);
    if (res.success) {
      await redisClient.del(key);
      return { success: true, message: "Password reset successfully" };
    } else {
      return {
        success: false,
        message: "Password reset failed",
        error: res.message,
      };
    }
  }
}
